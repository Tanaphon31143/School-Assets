<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class EquipmentLocation extends Model { use HasFactory; protected $fillable=['name','building','floor','description']; public function equipment(){return $this->hasMany(Equipment::class);} }
