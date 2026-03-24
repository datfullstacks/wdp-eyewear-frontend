import { Header } from '@/components/organisms/Header';
import { Card } from '@/components/ui/card';

export default function OperationPrescriptionCompatibilityPage() {
  return (
    <>
      <Header
        title="Prescription clarification"
        subtitle="Compatibility entry kept for the old operations URL"
      />

      <div className="p-6">
        <Card className="max-w-3xl border-amber-200 bg-amber-50 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            This clarification queue is owned by sales/support
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-700">
            Operations should handle prescription execution after the order has complete
            prescription data. Missing or unclear prescription information now belongs to the
            sales/support workflow at <strong>/sale/orders/prescription-needed</strong>.
          </p>
        </Card>
      </div>
    </>
  );
}
