<?php

use Illuminate\Database\Seeder;

class VideoSeeder extends Seeder
{

    private $allGenres;

    private $relations = [
        'genres_id' => [],
        'categories_id' => [],
    ];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $dir = \Storage::getDriver()->getAdapter()->getPathPrefix();
        \File::deleteDirectory($dir, true);
        $self = $this;
        $this->allGenres = \App\Models\Genre::all();
        \Illuminate\Database\Eloquent\Model::reguard();

        factory(\App\Models\Video::class, 5)
            ->make()
            ->each(function (\App\Models\Video $video) use ($self){
                $self->fetchRelations();
                \App\Models\Video::create(
                    array_merge(
                        $video->toArray(),
                        [
                            'thumb_file' => $self->getImageFile(),
                            'banner_file' => $self->getImageFile(),
                            'trailer_file' => $self->getVideoFile(),
                            'video_file' => $self->getVideoFile(),
                        ],
                        $this->relations
                    )
                );
            });
        \Illuminate\Database\Eloquent\Model::unguard();
    }

    public function fetchRelations(){
        $subGenres = $this->allGenres->random(5)->load('categories');
        $categoriesId = [];

        foreach ($subGenres as $genre) {
            array_push($categoriesId, ...$genre->categories->pluck('id')->toArray());
        }

        $categoriesId = array_unique($categoriesId);
        $genresId = $subGenres->pluck('id')->toArray();

        $this->relations['categories_id'] = $categoriesId;
        $this->relations['genres_id'] = $genresId;
    }

    public function getImageFile(){
        return new \Illuminate\Http\UploadedFile(
            storage_path('faker/thumbs/Laravel Framework.jpg'),
            'Laravel Framework.jpg'
        );
    }

    public function getVideoFile(){
        return new \Illuminate\Http\UploadedFile(
            storage_path('faker/videos/01-Como vai funcionar os uploads.mp4'),
            '01-Como vai funcionar os uploads.mp4'
        );
    }
}
