import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Store } from '../../types';
import { Header } from '../../components/common/Header';
import { StarRating } from '../../components/common/StarRating';
import { Search, MapPin, Store as StoreIcon, CheckCircle2 } from 'lucide-react';

export const UserStoresPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams();
      if (searchName) params.append('searchName', searchName);
      if (searchAddress) params.append('searchAddress', searchAddress);

      const res = await api.get(`/stores/user-stores?${params.toString()}`);
      setStores(res.data.stores);
    } catch (err) {
      console.error('Failed to fetch stores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [searchName, searchAddress]);

  const handleRateStore = async (storeId: string, ratingValue: number) => {
    try {
      await api.post('/ratings', { storeId, value: ratingValue });
      setToastMessage('Your rating has been saved successfully!');
      setTimeout(() => setToastMessage(null), 3000);
      fetchStores();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit rating');
    }
  };

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700 }}>Registered Stores</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Explore stores, view community ratings, and share your feedback by rating stores
          </p>
        </div>

        {toastMessage && (
          <div
            className="card"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              borderColor: 'rgba(16, 185, 129, 0.4)',
              color: '#6ee7b7',
              padding: '0.85rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Search Bar Controls */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search stores by Name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search stores by Address..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Store Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading store directory...</div>
        ) : stores.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <StoreIcon size={40} style={{ color: '#64748b', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No stores found</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Try adjusting your search terms for Name or Address.
            </p>
          </div>
        ) : (
          <div className="grid-3">
            {stores.map((store) => (
              <div key={store.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div className="brand-icon" style={{ flexShrink: 0, width: '40px', height: '40px' }}>
                      <StoreIcon size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{store.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                        <MapPin size={14} />
                        <span>{store.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Community Rating */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '8px', margin: '1rem 0' }}>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                      Overall Community Rating
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.35rem' }}>
                      <StarRating rating={store.overallRating || 0} size={20} />
                      <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        {store.overallRating !== undefined ? store.overallRating : 0}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        ({store.ratingCount || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating Input / Modify Section */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
                    {store.userSubmittedRating !== null ? 'Your Submitted Rating' : 'Submit Your Rating'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <StarRating
                      rating={store.userSubmittedRating || 0}
                      interactive={true}
                      onRate={(val) => handleRateStore(store.id, val)}
                      size={24}
                    />

                    {store.userSubmittedRating !== null && (
                      <span style={{ fontSize: '0.78rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                        Click to modify ({store.userSubmittedRating}★)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
