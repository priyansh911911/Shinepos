// Smart Inventory API Endpoints
// Add these to your backend server

// 1. Recipe Management APIs
app.get('/api/recipes', async (req, res) => {
  // Get all recipes with ingredients
  const recipes = await Recipe.find().populate('ingredients.inventoryItemId');
  res.json({ recipes });
});

app.post('/api/recipes', async (req, res) => {
  // Create new recipe
  const recipe = new Recipe(req.body);
  await recipe.save();
  res.json({ recipe });
});

// 2. Auto-deduct inventory when order is processed
app.post('/api/inventory/process-order', async (req, res) => {
  const { orderId } = req.body;
  
  try {
    const order = await Order.findById(orderId).populate('items.menuItemId');
    
    for (const orderItem of order.items) {
      const recipe = await Recipe.findOne({ menuItemId: orderItem.menuItemId });
      
      if (recipe) {
        for (const ingredient of recipe.ingredients) {
          await InventoryItem.findByIdAndUpdate(
            ingredient.inventoryItemId,
            { $inc: { currentStock: -(ingredient.quantity * orderItem.quantity) } }
          );
        }
      }
    }
    
    res.json({ success: true, message: 'Inventory updated automatically' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Wastage Tracking APIs
app.get('/api/wastage', async (req, res) => {
  const wastage = await WastageRecord.find().sort({ date: -1 });
  res.json({ wastage });
});

app.post('/api/wastage', async (req, res) => {
  const wastageRecord = new WastageRecord(req.body);
  await wastageRecord.save();
  
  // Update inventory stock
  await InventoryItem.findByIdAndUpdate(
    req.body.inventoryItemId,
    { $inc: { currentStock: -req.body.quantity } }
  );
  
  res.json({ wastageRecord });
});

// 4. Vendor Management APIs
app.get('/api/vendors', async (req, res) => {
  const vendors = await Vendor.find();
  res.json({ vendors });
});

app.post('/api/vendors', async (req, res) => {
  const vendor = new Vendor(req.body);
  await vendor.save();
  res.json({ vendor });
});

app.get('/api/vendor-prices', async (req, res) => {
  const prices = await VendorPrice.find()
    .populate('vendorId')
    .populate('inventoryItemId');
  res.json({ prices });
});

app.post('/api/vendor-prices', async (req, res) => {
  const vendorPrice = new VendorPrice(req.body);
  await vendorPrice.save();
  res.json({ vendorPrice });
});

// 5. Sales Analytics for Prediction
app.get('/api/analytics/sales-data', async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const sales = await Order.find({
    createdAt: { $gte: thirtyDaysAgo },
    status: 'completed'
  }).populate('items.menuItemId');
  
  res.json({ sales });
});

// 6. Purchase Order Generation
app.post('/api/purchase-orders', async (req, res) => {
  const purchaseOrder = new PurchaseOrder({
    ...req.body,
    status: 'pending',
    createdAt: new Date()
  });
  
  await purchaseOrder.save();
  res.json({ purchaseOrder });
});

// Database Models (MongoDB/Mongoose)

// Recipe Model
const recipeSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  ingredients: [{
    inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Wastage Record Model
const wastageSchema = new mongoose.Schema({
  inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  quantity: { type: Number, required: true },
  reason: { type: String, required: true },
  date: { type: Date, required: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Vendor Model
const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  paymentTerms: { type: String },
  deliveryTime: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Vendor Price Model
const vendorPriceSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  price: { type: Number, required: true },
  minOrderQty: { type: Number, default: 1 },
  validUntil: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Purchase Order Model
const purchaseOrderSchema = new mongoose.Schema({
  items: [{
    inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    quantity: { type: Number, required: true },
    estimatedCost: { type: Number }
  }],
  totalEstimatedCost: { type: Number },
  status: { type: String, enum: ['pending', 'approved', 'ordered', 'received'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  Recipe: mongoose.model('Recipe', recipeSchema),
  WastageRecord: mongoose.model('WastageRecord', wastageSchema),
  Vendor: mongoose.model('Vendor', vendorSchema),
  VendorPrice: mongoose.model('VendorPrice', vendorPriceSchema),
  PurchaseOrder: mongoose.model('PurchaseOrder', purchaseOrderSchema)
};