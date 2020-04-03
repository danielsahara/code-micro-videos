<?php

namespace Tests\Prod\Models;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\UploadedFile;
use Tests\Stubs\Models\UploadFilesStub;
use Tests\TestCase;
use Tests\Traits\TestProd;
use Tests\Traits\TestStorages;

class UploadFilesProdTest extends TestCase
{
    use TestStorages, TestProd;
    private $obj;

    protected function setUp(): void
    {
        parent::setUp();
        $this->skipTestIfNotProd();
        $this->obj = new UploadFilesStub();
        \Config::set('filesystems.default', 'gcs');
        $this->deleteAllFiles();
    }

    public function testUploadFile(){
        $file = UploadedFile::fake()->create('video.mp4');
        $this->obj->uploadFile($file);
        \Storage::assertExists("1/{$file->hashName()}");
    }

    public function testUploadFiles(){
        $file = UploadedFile::fake()->create('video.mp4');
        $file2 = UploadedFile::fake()->create('video.mp4');
        $this->obj->uploadFiles([$file, $file2]);

        \Storage::assertExists("1/{$file->hashName()}");
        \Storage::assertExists("1/{$file2->hashName()}");
    }

    public function testDeleteOldFiles(){
        $file1 = UploadedFile::fake()->create('video1.mp4')->size(1);
        $file2 = UploadedFile::fake()->create('video2.mp4')->size(1);

        $this->obj->uploadFiles([$file1, $file2]);
        $this->obj->deleteOldFiles();
        $this->assertCount(2, \Storage::allFiles());

        $this->obj->oldFiles = [$file1->hashName()];
        $this->obj->deleteOldFiles();
        \Storage::assertMissing("1/{$file1->hashName()}");
        \Storage::assertExists("1/{$file2->hashName()}");
    }

    public function testDeleteFile(){
        $file = UploadedFile::fake()->create('video.mp4');
        $this->obj->uploadFile($file);
        $filename = $file->hashName();
        $this->obj->deleteFile($filename);
        \Storage::assertMissing("1/{$filename}");

        $file = UploadedFile::fake()->create('video.mp4');
        $this->obj->uploadFile($file);
        $this->obj->deleteFile($file);
        \Storage::assertMissing("1/{$file->hashName()}");
    }

    public function testDeleteFiles(){
        $file = UploadedFile::fake()->create('video.mp4');
        $file2 = UploadedFile::fake()->create('video.mp4');

        $this->obj->uploadFiles([$file, $file2]);

        $this->obj->deleteFiles([$file->hashName(), $file2]);

        \Storage::assertMissing("1/{$file->hashName()}");
        \Storage::assertMissing("1/{$file2->hashName()}");
    }
}
