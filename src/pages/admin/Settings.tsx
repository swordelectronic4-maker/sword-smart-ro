// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Save, ChevronDown } from 'lucide-react';

const defaultSettings = {
  store: {
    storeName: 'Sword Store',
    storeOwner: 'Admin',
    address: '123 Commerce Street\nMumbai, Maharashtra\nIndia',
    email: 'admin@swordstore.com',
    telephone: '+91 98765 43210',
    metaTitle: 'Sword Store - Premium Shopping',
    metaDescription: 'Your one-stop destination for premium products at unbeatable prices.',
    metaKeyword: 'sword, store, shopping, premium, products',
  },
  local: {
    country: 'India',
    state: 'Gujarat',
    language: 'English',
    currency: 'INR ₹',
    lengthClass: 'Centimeter',
    weightClass: 'Kilogram',
  },
  option: {
    itemsPerPageAdmin: 20,
    itemsPerPageCatalog: 12,
    customerOnline: true,
    customerActivity: true,
    reviews: true,
    stockDisplay: true,
    stockCheckout: false,
    customerPrice: false,
  },
  image: {
    storeLogo: 'https://example.com/logo.png',
    iconFavicon: 'https://example.com/favicon.ico',
    categoryImageWidth: 200,
    categoryImageHeight: 200,
    productImageWidth: 800,
    productImageHeight: 800,
    productThumbWidth: 300,
    productThumbHeight: 300,
  },
  mail: {
    mailProtocol: 'SMTP',
    smtpHostname: 'smtp.gmail.com',
    smtpUsername: 'admin@swordstore.com',
    smtpPassword: '',
    smtpPort: '587',
    alertEmail: 'alerts@swordstore.com',
  },
  server: {
    maintenanceMode: false,
    seoUrls: true,
    ssl: true,
    gzipCompression: true,
    errorDisplay: false,
  },
};

const countries = ['India', 'UAE', 'USA', 'UK', 'Canada', 'Australia', 'Singapore', 'Sri Lanka', 'Bangladesh', 'Nepal'];
const states = ['Gujarat', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'Punjab', 'Kerala', 'Uttar Pradesh', 'West Bengal'];
const languages = ['English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil'];
const currencies = ['INR ₹', 'USD $', 'AED', 'GBP £', 'EUR €'];
const lengthClasses = ['Centimeter', 'Millimeter', 'Inch'];
const weightClasses = ['Kilogram', 'Gram', 'Pound'];
const mailProtocols = ['Mail', 'SMTP'];

const Toggle = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-gray-300">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-[#D4AF37]' : 'bg-gray-600'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  </div>
);

const InputField = ({ label, value, onChange, type = 'text', placeholder = '', rows }) => (
  <div className="mb-3">
    <label className="block text-xs text-gray-400 mb-1 mt-3">{label}</label>
    {rows ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded resize-none"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
      />
    )}
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="mb-3 relative">
    <label className="block text-xs text-gray-400 mb-1 mt-3">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded appearance-none cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-[#1a1a1a] text-white">
          {opt}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-[34px] w-4 h-4 text-gray-400 pointer-events-none" />
  </div>
);

export default function Settings() {
  const [activeTab, setActiveTab] = useState('store');
  const [settings, setSettings] = useState(defaultSettings);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('sword_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          store: { ...prev.store, ...(parsed.store || {}) },
          local: { ...prev.local, ...(parsed.local || {}) },
          option: { ...prev.option, ...(parsed.option || {}) },
          image: { ...prev.image, ...(parsed.image || {}) },
          mail: { ...prev.mail, ...(parsed.mail || {}) },
          server: { ...prev.server, ...(parsed.server || {}) },
        }));
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('sword_settings', JSON.stringify(settings));
    setSavedMessage('Settings saved successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const updateStore = (key, value) =>
    setSettings((prev) => ({ ...prev, store: { ...prev.store, [key]: value } }));
  const updateLocal = (key, value) =>
    setSettings((prev) => ({ ...prev, local: { ...prev.local, [key]: value } }));
  const updateOption = (key, value) =>
    setSettings((prev) => ({ ...prev, option: { ...prev.option, [key]: value } }));
  const updateImage = (key, value) =>
    setSettings((prev) => ({ ...prev, image: { ...prev.image, [key]: value } }));
  const updateMail = (key, value) =>
    setSettings((prev) => ({ ...prev, mail: { ...prev.mail, [key]: value } }));
  const updateServer = (key, value) =>
    setSettings((prev) => ({ ...prev, server: { ...prev.server, [key]: value } }));

  const tabs = [
    { id: 'store', label: 'Store' },
    { id: 'local', label: 'Local' },
    { id: 'option', label: 'Option' },
    { id: 'image', label: 'Image' },
    { id: 'mail', label: 'Mail' },
    { id: 'server', label: 'Server' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">System Settings</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your store configuration and preferences</p>
          </div>
          {savedMessage && (
            <div className="bg-green-500/20 border border-green-500/40 text-green-400 text-sm px-4 py-2 rounded">
              {savedMessage}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Store Tab */}
        {activeTab === 'store' && (
          <div className="bg-[#111] border border-white/10 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Store Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InputField label="Store Name" value={settings.store.storeName} onChange={(v) => updateStore('storeName', v)} />
              <InputField label="Store Owner" value={settings.store.storeOwner} onChange={(v) => updateStore('storeOwner', v)} />
              <div className="md:col-span-2">
                <InputField label="Address" value={settings.store.address} onChange={(v) => updateStore('address', v)} rows={3} />
              </div>
              <InputField label="Email" value={settings.store.email} onChange={(v) => updateStore('email', v)} type="email" />
              <InputField label="Telephone" value={settings.store.telephone} onChange={(v) => updateStore('telephone', v)} type="tel" />
              <InputField label="Meta Title" value={settings.store.metaTitle} onChange={(v) => updateStore('metaTitle', v)} />
              <InputField label="Meta Keyword" value={settings.store.metaKeyword} onChange={(v) => updateStore('metaKeyword', v)} />
              <div className="md:col-span-2">
                <InputField label="Meta Description" value={settings.store.metaDescription} onChange={(v) => updateStore('metaDescription', v)} rows={3} />
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={handleSave}
                className="bg-[#D4AF37] text-black text-sm font-medium px-6 py-2 rounded hover:bg-[#E5C158] transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Local Tab */}
        {activeTab === 'local' && (
          <div className="bg-[#111] border border-white/10 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Local Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <SelectField label="Country" value={settings.local.country} onChange={(v) => updateLocal('country', v)} options={countries} />
              <SelectField label="State / Region" value={settings.local.state} onChange={(v) => updateLocal('state', v)} options={states} />
              <SelectField label="Language" value={settings.local.language} onChange={(v) => updateLocal('language', v)} options={languages} />
              <SelectField label="Currency" value={settings.local.currency} onChange={(v) => updateLocal('currency', v)} options={currencies} />
              <SelectField label="Length Class" value={settings.local.lengthClass} onChange={(v) => updateLocal('lengthClass', v)} options={lengthClasses} />
              <SelectField label="Weight Class" value={settings.local.weightClass} onChange={(v) => updateLocal('weightClass', v)} options={weightClasses} />
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={handleSave}
                className="bg-[#D4AF37] text-black text-sm font-medium px-6 py-2 rounded hover:bg-[#E5C158] transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Option Tab */}
        {activeTab === 'option' && (
          <div className="bg-[#111] border border-white/10 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Store Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <div>
                <InputField
                  label="Items Per Page (Admin)"
                  value={settings.option.itemsPerPageAdmin}
                  onChange={(v) => updateOption('itemsPerPageAdmin', v)}
                  type="number"
                />
                <InputField
                  label="Items Per Page (Catalog)"
                  value={settings.option.itemsPerPageCatalog}
                  onChange={(v) => updateOption('itemsPerPageCatalog', v)}
                  type="number"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 mb-1 mt-3">Store Features</p>
                <Toggle label="Customer Online" checked={settings.option.customerOnline} onChange={(v) => updateOption('customerOnline', v)} />
                <Toggle label="Customer Activity" checked={settings.option.customerActivity} onChange={(v) => updateOption('customerActivity', v)} />
                <Toggle label="Reviews" checked={settings.option.reviews} onChange={(v) => updateOption('reviews', v)} />
                <Toggle label="Stock Display" checked={settings.option.stockDisplay} onChange={(v) => updateOption('stockDisplay', v)} />
                <Toggle label="Stock Checkout" checked={settings.option.stockCheckout} onChange={(v) => updateOption('stockCheckout', v)} />
                <Toggle label="Customer Price (Login Required)" checked={settings.option.customerPrice} onChange={(v) => updateOption('customerPrice', v)} />
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={handleSave}
                className="bg-[#D4AF37] text-black text-sm font-medium px-6 py-2 rounded hover:bg-[#E5C158] transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Image Tab */}
        {activeTab === 'image' && (
          <div className="bg-[#111] border border-white/10 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Image Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InputField label="Store Logo URL" value={settings.image.storeLogo} onChange={(v) => updateImage('storeLogo', v)} placeholder="https://example.com/logo.png" />
              <InputField label="Icon / Favicon URL" value={settings.image.iconFavicon} onChange={(v) => updateImage('iconFavicon', v)} placeholder="https://example.com/favicon.ico" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-white mb-3">Category Image Size</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Width (px)" value={settings.image.categoryImageWidth} onChange={(v) => updateImage('categoryImageWidth', v)} type="number" />
                <InputField label="Height (px)" value={settings.image.categoryImageHeight} onChange={(v) => updateImage('categoryImageHeight', v)} type="number" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-white mb-3">Product Image Size</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Width (px)" value={settings.image.productImageWidth} onChange={(v) => updateImage('productImageWidth', v)} type="number" />
                <InputField label="Height (px)" value={settings.image.productImageHeight} onChange={(v) => updateImage('productImageHeight', v)} type="number" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-white mb-3">Product Thumbnail Size</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Width (px)" value={settings.image.productThumbWidth} onChange={(v) => updateImage('productThumbWidth', v)} type="number" />
                <InputField label="Height (px)" value={settings.image.productThumbHeight} onChange={(v) => updateImage('productThumbHeight', v)} type="number" />
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={handleSave}
                className="bg-[#D4AF37] text-black text-sm font-medium px-6 py-2 rounded hover:bg-[#E5C158] transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Mail Tab */}
        {activeTab === 'mail' && (
          <div className="bg-[#111] border border-white/10 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Mail Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <SelectField label="Mail Protocol" value={settings.mail.mailProtocol} onChange={(v) => updateMail('mailProtocol', v)} options={mailProtocols} />
              <InputField label="SMTP Hostname" value={settings.mail.smtpHostname} onChange={(v) => updateMail('smtpHostname', v)} placeholder="smtp.gmail.com" />
              <InputField label="SMTP Username" value={settings.mail.smtpUsername} onChange={(v) => updateMail('smtpUsername', v)} placeholder="your-email@gmail.com" />
              <InputField label="SMTP Password" value={settings.mail.smtpPassword} onChange={(v) => updateMail('smtpPassword', v)} type="password" placeholder="Enter password" />
              <InputField label="SMTP Port" value={settings.mail.smtpPort} onChange={(v) => updateMail('smtpPort', v)} type="number" placeholder="587" />
              <InputField label="Alert Email" value={settings.mail.alertEmail} onChange={(v) => updateMail('alertEmail', v)} type="email" placeholder="alerts@yourstore.com" />
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={handleSave}
                className="bg-[#D4AF37] text-black text-sm font-medium px-6 py-2 rounded hover:bg-[#E5C158] transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Server Tab */}
        {activeTab === 'server' && (
          <div className="bg-[#111] border border-white/10 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Server Settings</h2>
            <p className="text-xs text-gray-500 mb-4">Configure advanced server options for your store.</p>
            <div className="space-y-1 max-w-xl">
              <Toggle label="Maintenance Mode" checked={settings.server.maintenanceMode} onChange={(v) => updateServer('maintenanceMode', v)} />
              <Toggle label="SEO URLs" checked={settings.server.seoUrls} onChange={(v) => updateServer('seoUrls', v)} />
              <Toggle label="SSL (Secure Sockets Layer)" checked={settings.server.ssl} onChange={(v) => updateServer('ssl', v)} />
              <Toggle label="GZIP Compression" checked={settings.server.gzipCompression} onChange={(v) => updateServer('gzipCompression', v)} />
              <Toggle label="Display Errors" checked={settings.server.errorDisplay} onChange={(v) => updateServer('errorDisplay', v)} />
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={handleSave}
                className="bg-[#D4AF37] text-black text-sm font-medium px-6 py-2 rounded hover:bg-[#E5C158] transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600">
            Settings are stored locally in your browser. Export and back up regularly.
          </p>
        </div>
      </div>
    </div>
  );
}
