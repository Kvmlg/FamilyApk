<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Administrators extends Model
{
    protected $fillable = ['users_id'];
    public $timestamps = false;

    public function administrator()
    {
        return $this->hasOne(User::class, 'users_id');
    }
}
