import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Inventory, 
  ShoppingBag, 
  People,
  Add
} from '@mui/icons-material';
import AdminCard from '../AdminCard/AdminCard';
import { ProductStats, getProductStats } from '@/features/products/services/get/getProductStats';
import './AdminDashboard.css';
import ROUTES from '@/shared/routes';

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [productStats, setProductStats] = useState<ProductStats>({
    total: 0,
    outOfStock: 0,
    featured: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch product statistics when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getProductStats();
        setProductStats(stats);
      } catch (error) {
        console.error('Error fetching product statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-grid">
        {/* Products Card */}
        <AdminCard
          title="Productos"
          icon={Inventory}
          type="products"
          statistics={[
            { label: 'Total', value: loading ? '...' : productStats.total, loading },
            { label: 'Sin stock', value: loading ? '...' : productStats.outOfStock, loading },
            { label: 'Destacados', value: loading ? '...' : productStats.featured, loading }
          ]}
          actions={[
            { 
              label: 'Gestionar', 
              onClick: () => router.push(ROUTES.ADMIN_PRODUCTS),
              primary: true
            },
            { 
              label: 'Añadir Nuevo', 
              onClick: () => router.push(ROUTES.ADMIN_PRODUCT_CREATE('create')),
            }
          ]}
        />

        {/* Orders Card (placeholder for future) */}
        <AdminCard
          title="Pedidos"
          icon={ShoppingBag}
          type="orders"
          statistics={[
            { label: 'Pendientes', value: 'Próximamente' },
            { label: 'Completados', value: 'Próximamente' }
          ]}
          actions={[
            { 
              label: 'Ver pedidos', 
              onClick: () => alert('Función disponible próximamente'),
              primary: true
            }
          ]}
        />

        {/* Users Card (placeholder for future) */}
        <AdminCard
          title="Usuarios"
          icon={People}
          type="users"
          statistics={[
            { label: 'Registrados', value: 'Próximamente' }
          ]}
          actions={[
            { 
              label: 'Ver usuarios', 
              onClick: () => alert('Función disponible próximamente'),
              primary: true
            }
          ]}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;