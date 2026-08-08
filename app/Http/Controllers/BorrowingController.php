<?php
namespace App\Http\Controllers;
use App\Http\Requests\StoreBorrowingRequest;
use App\Models\Equipment;
use App\Models\EquipmentBorrowing;
use App\Models\User;
use App\Notifications\BorrowingStatusNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
class BorrowingController extends Controller {
 public function index(Request $request){$all=$request->user()->hasAnyRole(['admin','teacher']);$borrowings=EquipmentBorrowing::with(['equipment','borrower','approver'])->when(!$all,fn($q)=>$q->where('user_id',$request->user()->id))->when($request->status,fn($q,$v)=>$q->where('status',$v))->latest()->paginate(15)->withQueryString();return view('borrowings.index',compact('borrowings'));}
 public function store(StoreBorrowingRequest $request){$data=$request->validated();$equipment=Equipment::findOrFail($data['equipment_id']);abort_if($equipment->status!=='available'||$data['quantity']>$equipment->quantity,422,'ครุภัณฑ์ไม่เพียงพอ');$data+=['user_id'=>$request->user()->id,'borrow_date'=>now(),'status'=>'pending'];$borrowing=EquipmentBorrowing::create($data);User::role('admin')->each(fn($admin)=>$admin->notify(new BorrowingStatusNotification($borrowing->id,'pending','มีคำขอยืมครุภัณฑ์ใหม่')));return back()->with('success','ส่งคำขอยืมเรียบร้อยแล้ว');}
 public function approve(Request $request,EquipmentBorrowing $borrowing){Gate::authorize('approve',$borrowing);$data=$request->validate(['approval_notes'=>'nullable|string|max:1000']);$borrowing->update($data+['status'=>'approved','approved_by'=>$request->user()->id]);$borrowing->equipment->update(['status'=>'borrowed']);$borrowing->borrower->notify(new BorrowingStatusNotification($borrowing->id,'approved','คำขอยืมครุภัณฑ์ได้รับการอนุมัติแล้ว'));return back()->with('success','อนุมัติคำขอยืมแล้ว');}
 public function reject(Request $request,EquipmentBorrowing $borrowing){Gate::authorize('approve',$borrowing);$data=$request->validate(['approval_notes'=>'required|string|max:1000']);$borrowing->update($data+['status'=>'rejected','approved_by'=>$request->user()->id]);$borrowing->borrower->notify(new BorrowingStatusNotification($borrowing->id,'rejected','คำขอยืมครุภัณฑ์ถูกปฏิเสธ'));return back()->with('success','ปฏิเสธคำขอยืมแล้ว');}
 public function return(Request $request,EquipmentBorrowing $borrowing){Gate::authorize('return',$borrowing);$borrowing->update(['status'=>'returned','actual_return_date'=>now(),'return_condition'=>$request->input('return_condition')]);$borrowing->equipment->update(['status'=>'available']);return back()->with('success','บันทึกการคืนแล้ว');}
}
