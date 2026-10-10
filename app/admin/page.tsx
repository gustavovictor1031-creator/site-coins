'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseUrl = (rawUrl && rawUrl.startsWith('http')) ? rawUrl : ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key')

const GAMES_CONFIG = [
  { name: 'Pokesigma', currency: 'diamond' },
  { name: 'Pokeidle World', currency: 'diamonds' },
  { name: 'Pokeidl', currency: 'gemas' },
  { name: 'Huntera', currency: 'coins' },
  { name: 'Pokepixel', currency: 'diamonds' },
  { name: 'Pkhunt', currency: 'safiras' }
]

interface GameConfig {
  id: number
  game_name: string
  currency_name: string
  mode: string
  stock_quantity: number
  price_per_unit: number
}

interface Transaction {
  id: number
  game_name: string
  type: string
  amount: number
  total_price: number
  user_contact: string
  created_at: string
}

export default function AdminPage() {
  const [games, setGames] = useState<GameConfig[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedGame, setSelectedGame] = useState(GAMES_CONFIG[0])
  const [mode, setMode] = useState('selling')
  const [stockQuantity, setStockQuantity] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    if (!supabaseUrl) {
      setLoading(false)
      return
    }

    try {
      const { data: gamesData, error: gError } = await supabase.from('site_config').select('*')
      const { data: transData } = await supabase.from('transactions').select('*').order('id', { ascending: false })

      if (gError) console.error(gError)
      if (gamesData) setGames(gamesData)
      if (transData) setTransactions(transData)
    } catch (err) {
      console.error('Erro de ligação ao Supabase:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSelectGame = (gameObj: typeof GAMES_CONFIG[0]) => {
    setSelectedGame(gameObj)
    const existing = games.find(g => g.game_name.toLowerCase() === gameObj.name.toLowerCase())
    if (existing) {
      setMode(existing.mode || 'selling')
      setStockQuantity(String(existing.stock_quantity ?? ''))
      setPricePerUnit(String(existing.price_per_unit ?? ''))
    } else {
      setStockQuantity('')
      setPricePerUnit('')
    }
  }

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabaseUrl) {
      alert('⚠️ Erro: As variáveis de ambiente do Supabase não estão configuradas na Vercel!')
      return
    }

    setSaving(true)

    try {
      const existing = games.find(g => g.game_name.toLowerCase() === selectedGame.name.toLowerCase())

      let error = null

      if (existing) {
        const res = await supabase
          .from('site_config')
          .update({ 
            mode, 
            currency_name: selectedGame.currency,
            stock_quantity: Number(stockQuantity) || 0,
            price_per_unit: Number(pricePerUnit) || 0
          })
          .eq('id', existing.id)
        error = res.error
      } else {
        const res = await supabase
          .from('site_config')
          .insert([
            { 
              game_name: selectedGame.name, 
              currency_name: selectedGame.currency,
              mode, 
              stock_quantity: Number(stockQuantity) || 0,
              price_per_unit: Number(pricePerUnit) || 0
            }
          ])
        error = res.error
      }

      if (error) {
        alert('Erro ao guardar: ' + error.message)
      } else {
        alert(`✅ Servidor ${selectedGame.name} guardado com sucesso! A redirecionar para a loja...`)
        // Redireciona automaticamente para a página dos clientes
        window.location.href = '/'
      }
    } catch (err: any) {
      alert('Falha na requisição: ' + (err.message || 'Erro desconhecido. Verifique a conexão com o Supabase.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#090d16', color: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '30px' }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        
        {/* Header Admin */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '26px', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '900' }}>
              ⚡ Painel Administrativo de Stocks & Preços
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
              Ao guardar, será redirecionado automaticamente para a loja pública dos clientes.
            </p>
          </div>
          <a href="/" style={{ color: '#38bdf8', textDecoration: 'none', background: '#0f172a', padding: '10px 18px', borderRadius: '10px', border: '1px solid #334155', fontWeight: 'bold', fontSize: '14px' }}>
            ← Ver Loja Principal
          </a>
        </div>

        {/* Seleção Clicável de Servidores */}
        <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #1e293b' }}>
          <h2 style={{ marginTop: 0, fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', fontWeight: '800' }}>
            1. Selecione o Servidor:
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {GAMES_CONFIG.map((item) => {
              const isSelected = selectedGame.name.toLowerCase() === item.name.toLowerCase()
              const gameData = games.find(g => g.game_name.toLowerCase() === item.name.toLowerCase())

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelectGame(item)}
                  style={{
                    padding: '16px 12px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #38bdf8' : '1px solid #334155',
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
                    color: isSelected ? '#38bdf8' : '#f8fafc',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: isSelected ? '0 0 20px rgba(56, 189, 248, 0.25)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '16px' }}>🎮 {item.name}</div>
                  <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px', textTransform: 'uppercase', fontWeight: '800' }}>
                    Moeda: {item.currency}
                  </div>
                  {gameData ? (
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                      Stock: {gameData.stock_quantity.toLocaleString()}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '6px' }}>
                      Pendente
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSaveGame} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚙️ A Configurar: <span style={{ color: '#fff' }}>{selectedGame.name}</span> 
              <span style={{ fontSize: '13px', background: '#0f172a', padding: '4px 10px', borderRadius: '6px', color: '#94a3b8', border: '1px solid #334155' }}>
                Unidade: {selectedGame.currency}
              </span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}>
                  Modo de Operação:
                </label>
                <select 
                  value={mode} 
                  onChange={(e) => setMode(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box', fontWeight: 'bold' }}
                >
                  <option value="selling">🟢 LOJA VENDE (Clientes compram)</option>
                  <option value="buying">🔴 LOJA COMPRA (Clientes vendem)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}>
                  Stock Atual ({selectedGame.currency}):
                </label>
                <input 
                  type="number" 
                  value={stockQuantity} 
                  onChange={(e) => setStockQuantity(e.target.value)} 
                  placeholder="Ex: 50000"
                  required 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}>
                  Preço por 1.000 (R$):
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  value={pricePerUnit} 
                  onChange={(e) => setPricePerUnit(e.target.value)} 
                  placeholder="Ex: 5.50"
                  required 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(to right, #22c55e, #16a34a)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)' }}
            >
              {saving ? 'A guardar...' : `💾 Guardar e Ir para a Loja (${selectedGame.name})`}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
