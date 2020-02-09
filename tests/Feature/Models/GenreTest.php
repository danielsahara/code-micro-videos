<?php

namespace Tests\Feature\Feature\Models;

use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class GenreTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(Genre::class, 1)->create();
        $genres = Genre::all();

        $this->assertCount(1, $genres);

        $genreKey = array_keys($genres->first()->getAttributes());

        $this->assertEqualsCanonicalizing(
            [
                'id',
                'name',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at'
            ],
            $genreKey
        );
    }

    public function testCreate(){
        $genre = Genre::create([
            'name' => 'Romance'
        ]);

        $genre->refresh();

        $this->assertEquals('Romance', $genre->name);
        $this->assertTrue($genre->is_active);
        $this->assertEquals(36, strlen($genre->id));
    }

    public function testUpdate(){
        $genre = factory(Genre::class)->create([
            'name' => 'Comedia',
            'is_active' => false
        ]);

        $data = [
            'name' => 'Comedia 2',
            'is_active' => true
        ];

        $genre->update($data);

        foreach ($data as $key => $value){
            $this->assertEquals($value, $genre->{$key});
        }
    }

    public function testDelete(){
        $genre = factory(Genre::class)->create([
            'name' => 'name1'
        ]);

        $genre->delete();

        $this->assertContains('deleted_at',$genre->getDates());

    }
}
