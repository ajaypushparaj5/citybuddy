import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Cpu, Zap, Activity } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page" style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Hero Section */}
      <section style={{ 
        padding: '120px 20px', 
        textAlign: 'center', 
        background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)' 
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.02em' }}>
            CityBuddy <span style={{ color: '#3b82f6' }}>OS</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '40px', lineHeight: 1.6 }}>
            The next-generation Digital Twin platform for real-time city monitoring, 
            infrastructure analysis, and intelligent urban planning.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/twin')}
              style={{
                padding: '16px 32px',
                fontSize: '1.1rem',
                fontWeight: 600,
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'transform 0.2s, background-color 0.2s',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Launch Digital Twin
            </button>
            <button 
              onClick={() => navigate('/citizen')}
              style={{
                padding: '16px 32px',
                fontSize: '1.1rem',
                fontWeight: 600,
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'transform 0.2s, background-color 0.2s',
              }}
              onMouseOver={(e) => { e.target.style.transform = 'scale(1.05)'; e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'; }}
              onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.backgroundColor = 'transparent'; }}
            >
              Citizen Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 20px', backgroundColor: '#0f172a' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '32px' 
        }}>
          <FeatureCard 
            icon={<Map size={32} color="#3b82f6" />} 
            title="3D OSM Integration" 
            description="Seamlessly render city infrastructure using OpenStreetMap data with elevation support." 
          />
          <FeatureCard 
            icon={<Cpu size={32} color="#10b981" />} 
            title="AI City Agent" 
            description="Autonomous monitor agent that detects anomalies and provides actionable urban insights." 
          />
          <FeatureCard 
            icon={<Zap size={32} color="#f59e0b" />} 
            title="Real-time Sensors" 
            description="Simulate and visualize live IoT sensor data across your digital twin environment." 
          />
          <FeatureCard 
            icon={<Activity size={32} color="#ef4444" />} 
            title="Emergency Response" 
            description="Integrated infrastructure mapping for hospitals, police, and fire rescue services." 
          />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '60px 20px', 
        textAlign: 'center', 
        borderTop: '1px solid #1e293b',
        color: '#64748b'
      }}>
        <p>© 2026 CityBuddy AI. Precision Urban Intelligence.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div style={{
      padding: '32px',
      backgroundColor: '#1e293b',
      borderRadius: '24px',
      border: '1px solid #334155',
      transition: 'border-color 0.3s'
    }}>
      <div style={{ marginBottom: '20px' }}>{icon}</div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>{title}</h3>
      <p style={{ color: '#94a3b8', lineHeight: 1.5 }}>{description}</p>
    </div>
  );
}

export default Home;
