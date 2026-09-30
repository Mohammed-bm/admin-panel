<?php

namespace App\Support\Filters;

class SearchFilter
{
    public static function apply($query, $search, array $columns)
    {
        $search = trim($search ?? '');

        if ($search === '') {
            return $query;
        }

        $query->where(function ($q) use ($search, $columns) {
            foreach ($columns as $column) {
                $q->orWhere($column, 'like', "%{$search}%");
            }
        });

        return $query;
    }
}