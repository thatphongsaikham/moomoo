// Menu Service - Handles all menu-related API calls
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class MenuService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add any auth tokens here if needed
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('Response error:', error);
        if (error.response?.status === 404) {
          console.warn('Menu endpoint not found - using fallback data');
        }
        return Promise.reject(error);
      }
    );
  }

  // Get menu by tier (259 or 299)
  async getMenuByTier(tier) {
    try {
      const response = await this.api.get(`/menu/tier/${tier}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch menu from API, using mock data');
      return this.getMockMenuByTier(tier);
    }
  }

  // Get all menu items
  async getAllMenuItems() {
    try {
      const response = await this.api.get('/menu');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch all menu items, using mock data');
      return this.getMockAllMenuItems();
    }
  }

  // Get special items (paid additions)
  async getSpecialItems() {
    try {
      const response = await this.api.get('/menu/special');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch special items, using mock data');
      return this.getMockSpecialItems();
    }
  }

  // Get menu categories
  async getCategories() {
    try {
      const response = await this.api.get('/menu/categories');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch categories, using mock data');
      return this.getMockCategories();
    }
  }

  // Mock data methods for fallback
  getMockMenuByTier(tier) {
    const standardItems = [
      { id: 201, name: 'หมูสไลซ์', nameEn: 'Pork Slices', price: 0, category: 'หมู', description: 'บางๆ นุ่มลิ้น', tier: 'standard' },
      { id: 202, name: 'สามชั้น', nameEn: 'Pork Belly', price: 0, category: 'หมู', description: 'ไขมันกรอบ เนื้อนุ่ม', tier: 'standard' },
      { id: 203, name: 'หมูหมักพิเศษ', nameEn: 'Marinated Pork', price: 0, category: 'หมู', description: 'หมักด้วยสูตรพิเศษ', tier: 'standard' },
      { id: 204, name: 'ลูกชิ้นรวม', nameEn: 'Mixed Meatballs', price: 0, category: 'เครื่องเคียง', description: 'หมู ไก่ เต้าหู้', tier: 'standard' },
      { id: 205, name: 'ผักสดรวม', nameEn: 'Fresh Vegetables', price: 0, category: 'ผัก', description: 'กะหล่ำปลี ผักกาดโรเลี้ยง', tier: 'standard' },
      { id: 206, name: 'ข้าวสวย', nameEn: 'Steamed Rice', price: 0, category: 'พื้นฐาน', description: 'ข้าวหอมมะลิ', tier: 'standard' },
      { id: 207, name: 'น้ำเปล่า', nameEn: 'Water', price: 0, category: 'เครื่องดื่ม', description: 'น้ำแร่บรรจุขวด', tier: 'standard' },
      { id: 208, name: 'บะหมี่/เส้น', nameEn: 'Noodles', price: 0, category: 'เส้น', description: 'เส้นบะหมี่แห้ง', tier: 'standard' },
      { id: 209, name: 'ไข่ไก่', nameEn: 'Eggs', price: 0, category: 'เครื่องเคียง', description: 'ไข่แดงอุ่นๆ', tier: 'standard' },
      { id: 210, name: 'เต้าหู้ทอด', nameEn: 'Fried Tofu', price: 0, category: 'เครื่องเคียง', description: 'เต้าหู้ทอดกรอบ', tier: 'standard' },
    ];

    const premiumItems = [
      { id: 301, name: 'สันคอออสเตรเลีย', nameEn: 'Australian Chuck Roll', price: 0, category: 'เนื้อ (พรีเมียม)', description: 'เนื้อนุ่ม รสชาติดี', tier: 'premium' },
      { id: 302, name: 'สันในวัวนุ่ม', nameEn: 'Tender Beef Loin', price: 0, category: 'เนื้อ (พรีเมียม)', description: 'นุ่มลิ้น หอมมัน', tier: 'premium' },
      { id: 303, name: 'กุ้งแม่น้ำ', nameEn: 'River Prawns', price: 0, category: 'อาหารทะเล (พรีเมียม)', description: 'สดๆ จากแม่น้ำ', tier: 'premium' },
      { id: 304, name: 'หอยเชลล์', nameEn: 'Mussels', price: 0, category: 'อาหารทะเล (พรีเมียม)', description: 'เนื้อแน่น หวาน', tier: 'premium' },
      { id: 305, name: 'เบคอนรมควัน', nameEn: 'Smoked Bacon', price: 0, category: 'หมู (พรีเมียม)', description: 'รมควันไฟไม้', tier: 'premium' },
      { id: 306, name: 'เนื้อวากิว', nameEn: 'Wagyu Beef', price: 0, category: 'เนื้อ (พรีเมียม)', description: 'มันแท้ นุ่มลิ้น', tier: 'premium' },
    ];

    if (tier === 259) {
      return { standard: standardItems, premium: [] };
    } else if (tier === 299) {
      return { standard: standardItems, premium: premiumItems };
    }

    return { standard: [], premium: [] };
  }

  getMockAllMenuItems() {
    const { standard, premium } = this.getMockMenuByTier(299);
    return [...standard, ...premium];
  }

  getMockSpecialItems() {
    return [
      { id: 401, name: 'หอยแครง', nameEn: 'Scallops', price: 120, category: 'อาหารทะเลพิเศษ', description: 'หอยแครงสดๆ นำเข้า', isSpecial: true },
      { id: 402, name: 'เนื้อแกะ', nameEn: 'Lamb Meat', price: 180, category: 'เนื้อพิเศษ', description: 'เนื้อแกะนำเข้าคุณภาพดี', isSpecial: true },
      { id: 403, name: 'เต้าหู้ไข่', nameEn: 'Egg Tofu', price: 80, category: 'เครื่องเคียงพิเศษ', description: 'เต้าหู้ไข่หอมๆ', isSpecial: true },
      { id: 404, name: 'เกี๊ยวซ่า', nameEn: 'Crispy Dumplings', price: 60, category: 'ของทอด', description: 'เกี๊ยวซ่ากรอบอร่อย', isSpecial: true },
      { id: 405, name: 'ไอศกรีมไข่เค็ม', nameEn: 'Salted Egg Ice Cream', price: 50, category: 'ของหวาน', description: 'ของหวานซิกเนเจอร์', isSpecial: true },
    ];
  }

  getMockCategories() {
    return [
      { id: 'all', name: 'ทั้งหมด', nameEn: 'All Items' },
      { id: 'หมู', name: 'หมู', nameEn: 'Pork' },
      { id: 'เนื้อ', name: 'เนื้อ', nameEn: 'Beef' },
      { id: 'อาหารทะเล', name: 'อาหารทะเล', nameEn: 'Seafood' },
      { id: 'เครื่องเคียง', name: 'เครื่องเคียง', nameEn: 'Side Dishes' },
      { id: 'ผัก', name: 'ผัก', nameEn: 'Vegetables' },
      { id: 'เครื่องดื่ม', name: 'เครื่องดื่ม', nameEn: 'Beverages' },
      { id: 'ของหวาน', name: 'ของหวาน', nameEn: 'Desserts' }
    ];
  }

  // Filter menu items by category
  filterItemsByCategory(items, category) {
    if (category === 'all') return items;

    return items.filter(item => {
      const itemCategory = item.category.toLowerCase();
      const searchCategory = category.toLowerCase();

      // Handle category matching with variations
      return itemCategory.includes(searchCategory) ||
             itemCategory.includes(searchCategory.replace('(พรีเมียม)', '')) ||
             itemCategory.includes(searchCategory.replace('พิเศษ', ''));
    });
  }

  // Calculate total price for items with quantities
  calculateTotal(items, quantities) {
    return items.reduce((total, item) => {
      const quantity = quantities[item.id] || 0;
      return total + (item.price * quantity);
    }, 0);
  }

  // Group items by category
  groupItemsByCategory(items) {
    return items.reduce((groups, item) => {
      const category = item.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {});
  }

  // Search menu items
  searchItems(items, query) {
    if (!query) return items;

    const searchTerm = query.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.nameEn.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    );
  }
}

// Create singleton instance
const menuService = new MenuService();

export default menuService;