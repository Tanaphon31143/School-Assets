<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class EquipmentMaintenance extends Model { use HasFactory, LogsActivity; protected $fillable=['equipment_id','reported_by','reported_date','issue_description','status','repair_cost','repaired_date','notes']; protected $casts=['reported_date'=>'date','repaired_date'=>'date','repair_cost'=>'decimal:2']; public function equipment(){return $this->belongsTo(Equipment::class);} public function reporter(){return $this->belongsTo(User::class,'reported_by');} public function getActivitylogOptions():LogOptions{return LogOptions::defaults()->logOnly(['status','repair_cost','repaired_date','notes'])->logOnlyDirty();} }
