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
import { getUserCount } from '@/features/auth/services/user/getUserCount';
import './AdminDashboard.css';
import ROUTES from '@/shared/routes';

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [productStats, setProductStats] = useState<ProductStats>({
    total: 0,
    outOfStock: 0,
    featured: 0
  });
  const [userCount, setUserCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Fetch statistics when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch both product stats and user count in parallel
        const [stats, users] = await Promise.all([
          getProductStats(),
          getUserCount()
        ]);
        
        setProductStats(stats);
        setUserCount(users);
      } catch (error) {
        console.error('Error fetching statistics:', error);
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

        {/* Users Card with real data */}
        <AdminCard
          title="Usuarios"
          icon={People}
          type="users"
          statistics={[
            { label: 'Registrados', value: loading ? '...' : userCount, loading }
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