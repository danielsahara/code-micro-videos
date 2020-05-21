<?php

namespace App\ModelFilters;

use App\Models\CastMember;

class CategoryFilter extends DefaultModelFilter
{
    protected $sortable = ['name', 'is_active', 'created_at'];

    public function search($search)
    {
        $this->query->where('name', 'LIKE', "%$search%");
    }

    public function isActive($isActive)
    {
        $isActive_ = (bool)$isActive;
        $this->where('is_active', (bool)$isActive_);
    }
}
