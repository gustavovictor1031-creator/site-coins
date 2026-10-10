'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseUrl = (rawUrl && rawUrl.startsWith('http')) ? rawUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const DEFAULT_GAMES = [
  'Pokesigma',
  'Pokeidle World',
  'Pokeidl',
  'Huntera',
  'Pokepixel',
  'Pkhunt'
]

interface GameConfig {
  id: number
  game_name: string
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
  const [selectedGameName, setSelectedGameName] = useState(DEFAULT_GAMES[0])
  const [mode, setMode] = useState('selling')
  const [stockQuantity, setStockQuantity] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (supabaseUrl.includes('placeholder')) {
      setLoading(false)
      return
    }

    const { data: gamesData } = await supabase.from('site_config').select('*')
    const { data: transData } = await supabase.from('transactions').select('*').order('id', { ascending: false })

    if (gamesData) setGames(gamesData)
    if (transData) setTransactions(transData)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Quando o utilizador clica num jogo da lista, carrega as informações dele
  const handleSelectGame = (gameName: string) => {
    setSelectedGameName(gameName)
    const existing = games.find(g => g.game_name.toLowerCase() === gameName.toLowerCase())
    if (existing) {
      setMode(existing.mode)
      setStockQuantity(String(existing.stock_quantity))
      setPricePerUnit(String(existing.price_per_unit || ''))
    } else {
      setStockQuantity('')
      setPricePerUnit('')
    }
  }

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase
      .from('site_config')
      .upsert(
        { 
          game_name: selectedGameName.toLowerCase().trim(), 
          mode, 
          stock_quantity: Number(stockQuantity) || 0,
          price_per_unit: Number(pricePerUnit) || 0
        },
        { onConflict: 'game_name' }
      )

    if (error) {
      alert('Erro ao salvar: ' + error.message)
    } else {
      alert(`Servidor ${selectedGameName} atualizado com sucesso!`)
      fetchData()
    }
  }

  return (
    <div style={{ backgroundColor: '#090d16', color: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '30px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '15px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '26px', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>⚡ Painel de Controlo Admin</h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Gestão de stock e preços dos servidores em tempo real</p>
          </div>
          <a href="/" style={{ color: '#38bdf8', textDecoration: 'none', background: '#1e293b', padding: '10px 18px', borderRadius: '8px', border: '1px solid #334155', fontWeight: 'bold', fontSize: '14px' }}>
            ← Ver Loja Pública
          </a>
        </div>

        {/* Seleção Clicável de Servidores */}
        <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #1e293b', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
          <h2 style={{ marginTop: 0, fontSize: '16px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>1. Selecione o Servidor para Configurar:</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '25px' }}>
            {DEFAULT_GAMES.map((game) => {
              const isSelected = selectedGameName.toLowerCase() === game.toLowerCase()
              const gameData = games.find(g => g.game_name.toLowerCase() === game.toLowerCase())

              return (
                <button
                  key={game}
                  type="button"
                  onClick={() => handleSelectGame(game)}
                  style={{
                    padding: '14px 10px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #38bdf8' : '1px solid #334155',
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
                    color: isSelected ? '#38bdf8' : '#f8fafc',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    boxShadow: isSelected ? '0 0 15px rgba(56, 189, 248, 0.3)' : 'none'
                  }}
                >
                  <div>🎮 {game}</div>
                  {gameData && (
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', fontWeight: 'normal' }}>
                      {gameData.stock_quantity.toLocaleString()} Coins
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Formulário do Servidor Selecionado */}
          <form onSubmit={handleSaveGame} style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚙️ Configurar: <span style={{ color: '#fff', textTransform: 'capitalize' }}>{selectedGameName}</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Modo de Operação:</label>
                <select 
                  value={mode} 
                  onChange={(e) => setMode(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box', fontWeight: 'bold' }}
                >
                  <option value="selling">🟢 Vendendo Coins (Loja vende)</option>
                  <option value="buying">🔴 Comprando Coins (Loja compra)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Quantidade em Stock:</label>
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
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Preço por 1.000 Coins (R$):</label>
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
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(to right, #22c55e, #16a34a)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}
            >
              Guardar Alterações do Servidor
            </button>
          </form>
        </div>

        {/* Histórico de Pedidos */}
        <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '16px', border: '1px solid #1e293b' }}>
          <h2 style={{ marginTop: 0, fontSize: '18px', color: '#f8fafc', marginBottom: '15px' }}>📋 Histórico de Solicitadores / Pedidos</h2>
          {transactions.length === 0 ? (
            <p style={{ color: '#64748b' }}>Nenhum pedido registado ainda.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left', color: '#94a3b8', fontSize: '13px' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>Servidor</th>
                    <th style={{ padding: '12px' }}>Tipo</th>
                    <th style={{ padding: '12px' }}>Coins</th>
                    <th style={{ padding: '12px' }}>Valor Total</th>
                    <th style={{ padding: '12px' }}>Contacto</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '12px', color: '#64748b' }}>#{t.id}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', textTransform: 'capitalize' }}>{t.game_name}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: t.type.includes('Compra') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: t.type.includes('Compra') ? '#4ade80' : '#f87171' }}>
                          {t.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{t.amount.toLocaleString()}</td>
                      <td style={{ padding: '12px', color: '#22c55e', fontWeight: 'bold' }}>R$ {Number(t.total_price || 0).toFixed(2)}</td>
                      <td style={{ padding: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{t.user_contact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
