<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Organization;

class OrganizationController extends Controller
{
    public function index()
    {
        $organizations = Organization::paginate(10);

        return Inertia::render('Organization/Index', [
            'organizations' => $organizations,
        ]);
    }
}
