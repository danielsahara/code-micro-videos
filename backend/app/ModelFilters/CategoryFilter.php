<?php

namespace App\ModelFilters;

use App\Models\CastMember;
use Illuminate\Database\Eloquent\Builder;

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

    public function genres($genres){
        $ids = explode(",", $genres);

        $this->whereHas('genres', function (Builder $query) use ($ids){
            $query
                ->whereIn('id', $ids);
        });
    }
}
