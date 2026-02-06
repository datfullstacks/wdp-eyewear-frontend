import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/atoms/Button';
import { Percent, Calendar, Tag } from 'lucide-react';

const currentDiscounts = [
  {
    id: 1,
    name: 'Flash Sale Cuối Tuần',
    type: 'Percentage',
    value: '20%',
    status: 'Active',
    startDate: '2024-02-01',
    endDate: '2024-02-07',
    usedCount: 45,
    maxUsage: 100,
  },
  {
    id: 2,
    name: 'Mua 1 Tặng 1',
    type: 'BOGO',
    value: 'Buy 1 Get 1',
    status: 'Active',
    startDate: '2024-02-01',
    endDate: '2024-02-15',
    usedCount: 23,
    maxUsage: 50,
  },
  {
    id: 3,
    name: 'Giảm Giá Sinh Viên',
    type: 'Percentage',
    value: '15%',
    status: 'Scheduled',
    startDate: '2024-02-10',
    endDate: '2024-02-28',
    usedCount: 0,
    maxUsage: 200,
  },
];

function DiscountsPage() {
  return (
    <>
      <Header 
        title="Quản lý Khuyến mãi" 
        subtitle="Tạo và quản lý các chương trình khuyến mãi"
        showAddButton
        addButtonLabel="Tạo khuyến mãi mới"
      />

      <div className="space-y-6 p-6">
        {/* Stats Overview */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="bg-card border-border rounded-lg border p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 text-green-600 rounded-full p-2">
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Khuyến mãi đang hoạt động</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-lg border p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full p-2">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Khuyến mãi sắp diễn ra</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-lg border p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 text-purple-600 rounded-full p-2">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Lượt sử dụng hôm nay</p>
                <p className="text-2xl font-bold">68</p>
              </div>
            </div>
          </div>
        </section>

        {/* Discounts List */}
        <section className="bg-card border-border rounded-lg border">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold">Danh sách khuyến mãi</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên chương trình
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Giá trị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sử dụng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{discount.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {discount.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {discount.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        discount.status === 'Active' 
                          ? 'bg-green-100 text-green-800'
                          : discount.status === 'Scheduled'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {discount.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {discount.startDate} - {discount.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {discount.usedCount}/{discount.maxUsage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button size="sm" variant="outline">
                        Sửa
                      </Button>
                      <Button size="sm" variant="outline">
                        Xem
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

export default DiscountsPage;