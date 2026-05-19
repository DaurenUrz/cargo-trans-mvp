import { withApiBase } from "../lib/api-base";

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { User, Plus, Search, Edit, Trash2, Phone, Mail, X, Save } from 'lucide-react';

interface IndividualClient {
  id: string;
  name: string;
  login: string;
  phone: string;
  created_at: string;
}

export function IndividualClients({ theme }: { theme?: 'light' | 'dark' }) {
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const [clients, setClients] = useState<IndividualClient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    login: '',
    phone: '',
    password: ''
  });

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(withApiBase('/api/clients/individual?ts=') + Date.now(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setClients(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch individual clients', res.status);
      }
    } catch (error) {
      console.error('Failed to fetch individual clients', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleEditClick = (client: IndividualClient) => {
    setFormData({
      name: client.name || '',
      login: client.login || '',
      phone: client.phone || '',
      password: '' // Leave empty for edit
    });
    setEditingClientId(client.id);
    setShowAddModal(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm(t('confirmDeleteClient') || 'Вы уверены, что хотите удалить этого клиента?')) return;
    try {
      const res = await fetch(withApiBase(`/api/clients/individual/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        fetchClients();
      } else {
        const error = await res.json();
        alert(error.message || 'Error deleting client');
      }
    } catch (error) {
      console.error('Error deleting client', error);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingClientId ? `/api/clients/individual/${editingClientId}` : '/api/clients/individual';
      const method = editingClientId ? 'PUT' : 'POST';

      const res = await fetch(withApiBase(url), {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          login: formData.login,
          ...(formData.password ? { password: formData.password } : {}), // only send if filled
          phone: formData.phone
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setEditingClientId(null);
        setFormData({
          name: '',
          login: '',
          phone: '',
          password: ''
        });
        fetchClients();
        alert('Клиент успешно сохранен');
      } else {
        const error = await res.json();
        alert(error.message || 'Ошибка при сохранении клиента');
      }
    } catch (error) {
      console.error('Error saving client', error);
      alert('Ошибка соединения');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    return (
      (client.name && client.name.toLowerCase().includes(query)) ||
      (client.login && client.login.toLowerCase().includes(query)) ||
      (client.phone && client.phone.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('individualClients')}</h1>
          <p className="text-gray-600">{t('individualClientsDesc')}</p>
        </div>
        <button
          onClick={() => {
            setEditingClientId(null);
            setFormData({ name: '', login: '', phone: '', password: '' });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('addIndividualClient')}
        </button>
      </div>

      <div className={`rounded-lg shadow-sm border mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder={t('searchIndividual')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                  : 'border-gray-300'
                  }`}
              />
            </div>
          </div>
        </div>

        <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {filteredClients.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {t('noIndividualClients')}
            </div>
          ) : (
            filteredClients.map((client) => (
              <div key={client.id} className={`p-6 transition-colors ${isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-indigo-900' : 'bg-indigo-100'
                      }`}>
                      <User className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{client.name || t('withoutName')}</h3>
                      </div>

                      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-2">
                          <Phone className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span>{client.phone || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span>{client.login}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <span className="font-medium">{t('dateCreated')}:</span>
                          <span>{client.created_at ? new Date(client.created_at).toLocaleDateString() : '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditClick(client)}
                      className={`p-2 rounded-lg transition-colors ${isDark
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}>
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClient(client.id)}
                      className={`p-2 rounded-lg transition-colors ${isDark
                      ? 'text-red-400 hover:bg-red-900/20'
                      : 'text-red-600 hover:bg-red-50'
                      }`}>
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )))}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-full max-w-lg mx-4 p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingClientId ? t('edit') : t('addIndividualClient')}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setEditingClientId(null); }}
                className={`p-1 rounded-full hover:bg-opacity-10 ${isDark ? 'hover:bg-gray-300 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('fullName') || 'ФИО'}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full p-2 rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Login (Email)</label>
                <input
                  type="email"
                  required
                  value={formData.login}
                  onChange={e => setFormData({ ...formData, login: e.target.value })}
                  className={`w-full p-2 rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  placeholder="login@email.com"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Телефон</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full p-2 rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  placeholder="+7..."
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('passwordLabel')}</label>
                <input
                  type="password"
                  required={!editingClientId}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full p-2 rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  minLength={6}
                  placeholder={editingClientId ? "Оставьте пустым для сохранения текущего" : ""}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {isLoading ? t('processing') : (editingClientId ? t('save') : t('createClient'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
