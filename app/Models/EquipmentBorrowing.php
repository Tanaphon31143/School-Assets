<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class EquipmentBorrowing extends Model { use HasFactory, LogsActivity; protected $fillable=['equipment_id','user_id','approved_by','quantity','borrow_date','expected_return_date','actual_return_date','purpose','status','approval_notes','return_condition']; protected $casts=['borrow_date'=>'date','expected_return_date'=>'date','actual_return_date'=>'date']; public function equipment(){return $this->belongsTo(Equipment::class);} public function borrower(){return $this->belongsTo(User::class,'user_id');} public function approver(){return $this->belongsTo(User::class,'approved_by');} public function getActivitylogOptions():LogOptions{return LogOptions::defaults()->logOnly(['status','expected_return_date','actual_return_date','approval_notes','return_condition'])->logOnlyDirty();} }
