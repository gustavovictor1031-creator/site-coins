'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseUrl = (rawUrl && rawUrl.startsWith('http')) ? rawUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface GameConfig {
  id: number
  game_name: string
  mode: string
  stock_quantity: number
}

export default function HomePage() {
  const [games, setGames] = useState<GameConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<GameConfig | null>(null)
  const [amount, setAmount] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchGames() {
      if (!supabaseUrl.includes('placeholder')) {
        const { data } = await supabase.from('site_config').select('*')
        if (data && data.length > 0) {
          setGames(data)
        }
      }
      setLoading(false)
    }
    fetchGames()
  }, [])

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGame || !amount || !contact) return

    setSubmitting(true)

    const { error } = await supabase.from('transactions').insert([
      {
        game_name: selectedGame.game_name,
        type: selectedGame.mode === 'selling' ? 'Compra de Cliente' : 'Venda para Loja',
        amount: Number(amount),
        price: 0,
        user_contact: contact,
      }
    ])

    setSubmitting(false)

    if (error) {
      alert('Erro ao processar pedido: ' + error.message)
    } else {
      alert('Pedido enviado com sucesso! Entraremos em contacto brevemente.')
      setSelectedGame(null)
      setAmount('')
      setContact('')
    }
  }

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      {/* Header */}
      <header style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #1e293b' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>🪙 CoinsStore Gamer</h1>
        <a href="/admin" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', border: '1px solid #334155', padding: '8px 16px', borderRadius: '6px' }}>Área do Admin</a>
      </header>

      {/* Hero Banner */}
      <section style={{ textAlign: 'center', margin: '40px 0' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '10px' }}>Compre & Venda Coins com Segurança</h2>
        <p style={{ color: '#94a3b8', fontSize: '18px' }}>Selecione o seu servidor abaixo e faça o seu pedido instantaneamente.</p>
      </section>

      {/* Main Grid */}
      <main style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>A carregar servidores...</p>
        ) : games.length === 0 ? (
          <div style={{ textAlign: 'center', background: '#1e293b', padding: '40px', borderRadius: '12px' }}>
            <p style={{ margin: 0, color: '#94a3b8' }}>Nenhum jogo disponível no momento. Adicione jogos através do Painel Admin.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {games.map((g) => (
              <div 
                key={g.id} 
                style={{ 
                  backgroundColor: '#1e293b', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  border: '1px solid #334155',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '22px', margin: 0, textTransform: 'capitalize' }}>{g.game_name}</h3>
                    <span style={{ 
                      backgroundColor: g.mode === 'selling' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                      color: g.mode === 'selling' ? '#4ade80' : '#f87171',
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {g.mode === 'selling' ? 'Disponível' : 'A Comprar'}
                    </span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                    Stock Atual: <strong style={{ color: '#f8fafc' }}>{g.stock_quantity.toLocaleString()} Coins</strong>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedGame(g)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: g.mode === 'selling' ? '#0284c7' : '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {g.mode === 'selling' ? 'Comprar Coins' : 'Vender para a Loja'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Pedido */}
        {selectedGame && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', maxWidth: '450px', width: '100%', border: '1px solid #334155' }}>
              <h3 style={{ marginTop: 0, fontSize: '22px' }}>
                {selectedGame.mode === 'selling' ? `Comprar Coins - ${selectedGame.game_name}` : `Vender Coins - ${selectedGame.game_name}`}
              </h3>
              
              <form onSubmit={handleOrder}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#94a3b8' }}>Quantidade de Coins:</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ex: 5000"
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#94a3b8' }}>O seu Discord ou WhatsApp:</label>
                  <input 
                    type="text" 
                    value={contact} 
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Ex: user#1234 ou (11) 99999-9999"
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => setSelectedGame(null)}
                    style={{ flex: 1, padding: '12px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    style={{ flex: 1, padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {submitting ? 'A enviar...' : 'Confirmar Pedido'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
