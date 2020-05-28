<?php

namespace App\ModelFilters;

class VideoFilter extends DefaultModelFilter
{
    protected $sortable = ['name', 'is_active', 'created_at'];
}
