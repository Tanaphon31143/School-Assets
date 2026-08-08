<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class EquipmentDisposal extends Model { use HasFactory; protected $fillable=['equipment_id','disposal_date','reason','approved_by','disposal_method','notes']; protected $casts=['disposal_date'=>'date']; public function equipment(){return $this->belongsTo(Equipment::class);} public function approver(){return $this->belongsTo(User::class,'approved_by');} }
