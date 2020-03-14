<?php


namespace Tests\Traits;


trait TestProd
{
    protected function skipTestIfNotProd($message = ''){
        if($this->isTestingProd()){
            $this->markTestSkipped('Testes de producao');
        }
    }

    protected function isTestingProd($message = ''){
        return env('TESTING_PROD' ) !== false;
    }
}
