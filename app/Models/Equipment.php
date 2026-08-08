<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class Equipment extends Model { use HasFactory, LogsActivity; protected $table='equipment'; protected $fillable=['code','name','equipment_category_id','equipment_location_id','brand','model','serial_number','purchase_date','purchase_price','quantity','unit','status','condition','image','qr_code','warranty_expire_date','notes','created_by']; protected $casts=['purchase_date'=>'date','purchase_price'=>'decimal:2','warranty_expire_date'=>'date']; public function category(){return $this->belongsTo(EquipmentCategory::class,'equipment_category_id');} public function location(){return $this->belongsTo(EquipmentLocation::class,'equipment_location_id');} public function creator(){return $this->belongsTo(User::class,'created_by');} public function borrowings(){return $this->hasMany(EquipmentBorrowing::class);} public function maintenances(){return $this->hasMany(EquipmentMaintenance::class);} public function disposals(){return $this->hasMany(EquipmentDisposal::class);} public function getActivitylogOptions():LogOptions{return LogOptions::defaults()->logOnly(['code','name','status','condition','equipment_location_id','quantity'])->logOnlyDirty();} }
