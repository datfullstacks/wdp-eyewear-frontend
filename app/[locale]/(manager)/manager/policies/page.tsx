import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/atoms/Button';
import { 
  Settings, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  Edit3,
} from 'lucide-react';

const policies = [
  {
    id: 1,
    title: 'Chính sách Đổi trả sản phẩm',
    category: 'Bán hàng',
    status: 'Active',
    lastModified: '2024-01-15',
    description: 'Quy định về việc đổi trả sản phẩm trong vòng 30 ngày',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Chính sách Bảo hành',
    category: 'Hỗ trợ',
    status: 'Active',
    lastModified: '2024-01-10',
    description: 'Điều kiện và quy trình bảo hành sản phẩm',
    priority: 'high',
  },
  {
    id: 3,
    title: 'Quy trình Xử lý khiếu nại',
    category: 'Hỗ trợ',
    status: 'Draft',
    lastModified: '2024-02-01',
    description: 'Hướng dẫn xử lý khiếu nại của khách hàng',
    priority: 'medium',
  },
  {
    id: 4,
    title: 'Chính sách Bảo mật thông tin',
    category: 'Bảo mật',
    status: 'Active',
    lastModified: '2023-12-20',
    description: 'Quy định về bảo vệ thông tin cá nhân khách hàng',
    priority: 'high',
  },
  {
    id: 5,
    title: 'Quy trình Thanh toán',
    category: 'Tài chính',
    status: 'Review',
    lastModified: '2024-01-25',
    description: 'Các phương thức thanh toán và quy trình xử lý',
    priority: 'medium',
  },
];

const systemSettings = [
  {
    id: 1,
    category: 'Cấu hình chung',
    settings: [
      { key: 'Thời gian làm việc', value: '8:00 - 17:00' },
      { key: 'Múi giờ', value: 'UTC+7 (Việt Nam)' },
      { key: 'Ngôn ngữ mặc định', value: 'Tiếng Việt' },
    ],
  },
  {
    id: 2,
    category: 'Cấu hình bán hàng',
    settings: [
      { key: 'Thời gian giữ giỏ hàng', value: '30 phút' },
      { key: 'Số lượng tối đa/đơn hàng', value: '10 sản phẩm' },
      { key: 'Phí ship mặc định', value: '25,000 VND' },
    ],
  },
  {
    id: 3,
    category: 'Thông báo',
    settings: [
      { key: 'Email thông báo đơn hàng', value: 'Bật' },
      { key: 'SMS xác nhận', value: 'Bật' },
      { key: 'Push notification', value: 'Tắt' },
    ],
  },
];

function PoliciesPage() {
  return (
    <>
      <Header 
        title="Chính sách & Cài đặt" 
        subtitle="Quản lý chính sách cửa hàng và cài đặt hệ thống"
        showAddButton
        addButtonLabel="Tạo chính sách mới"
      />

      <div className="space-y-8 p-6">
        {/* Quick Stats */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="bg-card border-border rounded-lg border p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 text-green-600 rounded-full p-2">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chính sách hiệu lực</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-lg border p-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 text-yellow-600 rounded-full p-2">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đang soạn thảo</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-lg border p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full p-2">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đang xem xét</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-lg border p-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 text-red-600 rounded-full p-2">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cần cập nhật</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </div>
        </section>

        {/* Policies List */}
        <section className="bg-card border-border rounded-lg border">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold">Danh sách chính sách</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Độ ưu tiên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cập nhật cuối
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {policies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{policy.title}</div>
                        <div className="text-gray-500 text-sm">{policy.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {policy.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        policy.status === 'Active' 
                          ? 'bg-green-100 text-green-800'
                          : policy.status === 'Draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        policy.priority === 'high' 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {policy.priority === 'high' ? 'Cao' : 'Trung bình'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {policy.lastModified}
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

        {/* System Settings */}
        <section className="bg-card border-border rounded-lg border">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Cài đặt hệ thống</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {systemSettings.map((section) => (
              <div key={section.id}>
                <h3 className="text-md font-medium mb-3">{section.category}</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {section.settings.map((setting, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{setting.key}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{setting.value}</span>
                        <Button size="sm" variant="ghost">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default PoliciesPage;