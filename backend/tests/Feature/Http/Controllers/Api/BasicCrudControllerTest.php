<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\BasicCrudController;
use App\Models\Category;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestResponse;
use Illuminate\Foundation\Testing\WithFaker;
use \Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Tests\Stubs\Controllers\CategoryControllerStub;
use Tests\Stubs\Models\CategoryStub;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class BasicCrudControllerTest extends TestCase
{
    private $controller;
    protected function setUp(): void
    {
        parent::setUp();
        CategoryStub::dropTable();
        CategoryStub::createTable();
        $this->controller = new CategoryControllerStub();
    }

    protected function tearDown(): void
    {
        CategoryStub::dropTable();
        parent::tearDown();
    }

    public function testIndex(){

        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $result = $this->controller->index();
        $serialized = $result->response()->getData(true);
        $this->assertEquals(
            [$category->toArray()],
            $serialized['data']);
        $this->assertArrayHasKey('meta', $serialized);
        $this->assertArrayHasKey('links', $serialized);
    }

    /**
     * @expectedException  \Illuminate\Validation\ValidationException
     */
    public function testInvalidationDataInStore(){
        //Mockery php
        $request = \Mockery::mock(Request::class);
        $request
            -> shouldReceive('all')
            ->once()
            ->andReturn(['name' => '']);

        $this->controller->store($request);
    }

    public function testStore(){
        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test_name', 'description' => 'test_description']);

        $result = $this->controller->store($request);
        $serialized = $result->response()->getData(true);
        $this->assertEquals(CategoryStub::first()->toArray(), $serialized['data']);
    }

    public function testIfFindOrFailFetchModel(){
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);

        $reflectionClass = new \ReflectionClass(BasicCrudController::class);
        $reflectionMethod = $reflectionClass->getMethod('findOrFail');
        $reflectionMethod->setAccessible(true);

        $result = $reflectionMethod->invokeArgs($this->controller, [$category->id]);
        $this->assertInstanceOf(CategoryStub::class, $result);
    }

    /**
     * @expectedException \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function testIfFindOrFailThrowExceptionWhenIdInvalid(){

        $reflectionClass = new \ReflectionClass(BasicCrudController::class);
        $reflectionMethod = $reflectionClass->getMethod('findOrFail');
        $reflectionMethod->setAccessible(true);

        $result = $reflectionMethod->invokeArgs($this->controller, [0]);
        $this->assertInstanceOf(CategoryStub::class, $result);
    }

    public function testShow(){
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);

        $result = $this->controller->show($category->id);

        $serialized = $result->response()->getData(true);
        $this->assertEquals($category->toArray(), $serialized['data']);
    }

    public function testUpdate(){
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $request = \Mockery::mock(Request::class);
        $request
            -> shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test_name_updated', 'description' => 'test_description_updated']);

        $result = $this->controller->update($request, $category->id);

        $serialized = $result->response()->getData(true);
        $category->refresh();
        $this->assertEquals($category->toArray(), $serialized['data']);
    }

    public function testDestroy(){
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $response = $this->controller->destroy($category->id);

        $this
            ->createTestResponse($response)
            ->assertStatus(204);
        $this->assertCount(0, CategoryStub::all());
    }
}
