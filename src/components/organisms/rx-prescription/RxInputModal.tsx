import { PrescriptionData } from '@/types/rxPrescription';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, Upload } from 'lucide-react';
import { Input } from '@/components/atoms';

interface RxInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: string;
  customerName?: string;
  form: PrescriptionData;
  onFormChange: (form: PrescriptionData) => void;
  onSave: () => void;
}

export const RxInputModal = ({
  open,
  onOpenChange,
  orderId,
  customerName,
  form,
  onFormChange,
  onSave,
}: RxInputModalProps) => {
  const updateField = (field: keyof PrescriptionData, value: string) => {
    onFormChange({ ...form, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[92vw] max-h-[80vh] overflow-y-auto p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Nhập thông số mắt
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Đơn hàng: {orderId} - {customerName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Eye measurements table */}
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2 text-center text-sm">
              <div></div>
              <div className="font-medium">SPH (Sphere)</div>
              <div className="font-medium">CYL (Cylinder)</div>
              <div className="font-medium">AXIS (Trục)</div>
              <div className="font-medium">ADD</div>
            </div>
            <div className="grid grid-cols-5 items-center gap-2">
              <Label className="text-right text-foreground/80">
                Mắt phải (OD)
              </Label>
              <Input
                placeholder="-2.00"
                value={form.sphereRight}
                onChange={(e) => updateField('sphereRight', e.target.value)}
              />
              <Input
                placeholder="-0.50"
                value={form.cylinderRight}
                onChange={(e) => updateField('cylinderRight', e.target.value)}
              />
              <Input
                placeholder="180"
                value={form.axisRight}
                onChange={(e) => updateField('axisRight', e.target.value)}
              />
              <Input
                placeholder="+2.00"
                value={form.addRight}
                onChange={(e) => updateField('addRight', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-2">
              <Label className="text-right text-foreground/80">
                Mắt trái (OS)
              </Label>
              <Input
                placeholder="-1.75"
                value={form.sphereLeft}
                onChange={(e) => updateField('sphereLeft', e.target.value)}
              />
              <Input
                placeholder="-0.25"
                value={form.cylinderLeft}
                onChange={(e) => updateField('cylinderLeft', e.target.value)}
              />
              <Input
                placeholder="175"
                value={form.axisLeft}
                onChange={(e) => updateField('axisLeft', e.target.value)}
              />
              <Input
                placeholder="+2.00"
                value={form.addLeft}
                onChange={(e) => updateField('addLeft', e.target.value)}
              />
            </div>
          </div>

          {/* PD */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground/80">
                PD (Khoảng cách đồng tử)
              </Label>
              <Input
                placeholder="64"
                value={form.pd}
                onChange={(e) => updateField('pd', e.target.value)}
              />
            </div>
          </div>

          {/* Lens Type & Coating */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground/80">Loại tròng</Label>
              <Select
                value={form.lensType}
                onValueChange={(v) => updateField('lensType', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại tròng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Đơn tròng">Đơn tròng</SelectItem>
                  <SelectItem value="Đa tròng">Đa tròng (Bifocal)</SelectItem>
                  <SelectItem value="Đa tròng lũy tiến">
                    Đa tròng lũy tiến (Progressive)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">Lớp phủ</Label>
              <Select
                value={form.coating}
                onValueChange={(v) => updateField('coating', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lớp phủ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Anti-Glare">Anti-Glare</SelectItem>
                  <SelectItem value="Blue Light">Blue Light</SelectItem>
                  <SelectItem value="Blue Light + Anti-Glare">
                    Blue Light + Anti-Glare
                  </SelectItem>
                  <SelectItem value="Photochromic">
                    Photochromic (Đổi màu)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-foreground/80">Ghi chú</Label>
            <Textarea
              placeholder="Ghi chú thêm về thông số hoặc yêu cầu đặc biệt..."
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
            />
          </div>

          {/* Upload button */}
          <div className="bg-muted/30 flex items-center gap-4 rounded-lg border border-dashed p-3">
            <Upload className="text-foreground/70 h-8 w-8" />
            <div className="flex-1">
              <p className="font-medium">Tải lên đơn thuốc</p>
              <p className="text-foreground/70 text-sm">
                Tải ảnh đơn thuốc từ bác sĩ (JPG, PNG, PDF)
              </p>
            </div>
            <Button variant="outline">Chọn file</Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={onSave}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Lưu thông số
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
