import Sale from '../models/Sale.js';

// Get all sales with optional filters
export const getAllSales = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      date: req.query.date,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      limit: req.query.limit,
      offset: req.query.offset
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const sales = await Sale.getAll(filters);
    res.json(sales);
  } catch (error) {
    console.error('Error getting sales:', error);
    // Return empty array when database is not available
    res.json([]);
  }
};

// Get sale by ID
export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.getById(id);

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    console.error('Error getting sale:', error);
    res.status(404).json({ error: 'Sale not found' });
  }
};

// Create new sale with ProductsManager integration support
export const createSale = async (req, res) => {
  try {
    const {
      date,
      productName,
      price,
      quantity,
      category,
      product_id = null,  // New: reference to ProductsManager product
      discount = 0,
      tax_amount = 0,
      payment_method = 'cash',
      customer_id = null,
      notes = '',
      use_inventory_integration = false  // Flag to determine if we should update inventory
    } = req.body;

    // Validation
    if (!date || !productName || !price || !quantity || !category) {
      return res.status(400).json({
        error: 'Missing required fields: date, productName, price, quantity, category'
      });
    }

    if (price <= 0 || quantity <= 0) {
      return res.status(400).json({
        error: 'Price and quantity must be greater than 0'
      });
    }

    // Calculate total price - Fixed NaN issue
    const safePrice = parseFloat(price) || 0;
    const safeQuantity = parseInt(quantity) || 0;
    const safeDiscount = parseFloat(discount) || 0;
    const safeTaxAmount = parseFloat(tax_amount) || 0;

    if (safePrice <= 0 || safeQuantity <= 0) {
      return res.status(400).json({
        error: 'Price and quantity must be greater than 0'
      });
    }

    const totalPrice = (safePrice * safeQuantity) - safeDiscount + safeTaxAmount;

    // Generate sale number
    const saleNumber = `SALE-${Date.now()}-${product_id || Math.random().toString(36).substr(2, 9)}`;

    const saleData = {
      date,
      product_id: product_id ? parseInt(product_id) : null,
      productName: productName.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      category: category.trim(),
      totalPrice,
      discount: parseFloat(discount || 0),
      tax_amount: parseFloat(tax_amount || 0),
      payment_method: payment_method || 'cash',
      customer_id: customer_id ? parseInt(customer_id) : null,
      notes: (notes || '').trim(),
      sale_number: saleNumber
    };

    // If inventory integration is enabled and we have a product_id,
    // we should call the ProductsManager API to record the sale there too
    if (use_inventory_integration && product_id) {
      try {
        // Call ProductsManager integration API to record sale and update inventory
        const integrationResponse = await fetch('http://localhost:5000/api/integration/sale', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: product_id,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            date: date,
            customer_id: customer_id || null,
            payment_method: payment_method || 'cash',
            notes: notes || '',
            discount: parseFloat(discount || 0),
            tax_amount: parseFloat(tax_amount || 0)
          })
        });

        if (!integrationResponse.ok) {
          const errorData = await integrationResponse.json();
          return res.status(400).json({
            error: 'Inventory integration failed: ' + (errorData.error || 'Unknown error'),
            details: errorData
          });
        }

        const integrationData = await integrationResponse.json();
        console.log('✅ Inventory updated via ProductsManager:', integrationData);

        // Add integration info to response
        saleData.inventory_integration = integrationData.inventory_update;
      } catch (integrationError) {
        console.error('❌ Inventory integration failed:', integrationError);
        // Continue with sale creation but warn about integration failure
        saleData.integration_warning = 'Sale created but inventory integration failed: ' + integrationError.message;
      }
    }

    const newSale = await Sale.create(saleData);
    res.status(201).json(newSale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Database not available - sale not saved' });
  }
};

// Update sale
export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, productName, price, quantity, category } = req.body;

    // Check if sale exists
    const existingSale = await Sale.getById(id);
    if (!existingSale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Validation
    if (!date || !productName || !price || !quantity || !category) {
      return res.status(400).json({
        error: 'Missing required fields: date, productName, price, quantity, category'
      });
    }

    if (price <= 0 || quantity <= 0) {
      return res.status(400).json({
        error: 'Price and quantity must be greater than 0'
      });
    }

    // Calculate total price - Fixed NaN issue
    const safePrice = parseFloat(price) || 0;
    const safeQuantity = parseInt(quantity) || 0;

    if (safePrice <= 0 || safeQuantity <= 0) {
      return res.status(400).json({
        error: 'Price and quantity must be greater than 0'
      });
    }

    const totalPrice = safePrice * safeQuantity;

    const saleData = {
      date,
      productName: productName.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      category: category.trim(),
      totalPrice
    };

    const updatedSale = await Sale.update(id, saleData);
    res.json(updatedSale);
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({ error: 'Database not available - sale not updated' });
  }
};

// Delete sale
export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Sale.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ error: 'Database not available - sale not deleted' });
  }
};

// Get sales statistics
export const getSalesStats = async (req, res) => {
  try {
    console.log('📊 Getting sales statistics...');

    const stats = await Sale.getStats();
    const topCategories = await Sale.getTopCategories(5);
    const recentSales = await Sale.getRecentSales(5);
    const dailyRevenue = await Sale.getDailyRevenue(7);

    const response = {
      ...stats,
      topCategories,
      recentSales,
      dailyRevenue
    };

    console.log('📤 Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error getting stats:', error);
    // Return empty stats when database is not available
    res.json({
      totalSales: 0,
      totalRevenue: 0,
      totalProducts: 0,
      averageSale: 0,
      topCategories: [],
      recentSales: [],
      dailyRevenue: []
    });
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Sale.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    // Return empty array when database is not available
    res.json([]);
  }
};

// Get aggregated sales grouped by product
export const getAggregatedSales = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const aggregatedData = await Sale.getAggregated(filters);
    res.json(aggregatedData);
  } catch (error) {
    console.error('Error getting aggregated sales:', error);
    res.json([]);
  }
};
