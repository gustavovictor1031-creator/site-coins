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
  const [selectedGame, setSelectedGame] = useState('')
  const [contact, setContact] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchStoreData() {
      if (supabaseUrl.includes('placeholder')) {
        setLoading(false)
        return
      }
      const { data } = await supabase.from('site_config').select('*')
      if (data) {
        setGames(data)
        if (data.length > 0) setSelectedGame(data[0].game_name)
      }
      setLoading(false)
    }
    fetchStoreData()
  }, [])

  const currentGame = games.find(g => g.game_name === selectedGame)

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contact || !amount || !selectedGame) return

    setSubmitting(true)
    const { error } = await supabase.from('transactions').insert([
      {
        game_name: selectedGame,
        type: currentGame?.mode === 'selling' ? 'Compra de Cliente' : 'Venda para Loja',
        amount: Number(amount),
        price: 0, // Pode ajustar se quiser calcular preço por unidade
        user_contact: contact,
      }
    ])

    setSubmitting(false)

    if (error) {
      alert('Erro ao enviar pedido: ' + error.message)
    } else {
      alert('Pedido enviado com sucesso! Entraremos em contacto em breve.')
      setContact('')
      setAmount('')
    }
  }

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Loja de Coins 🪙</h1>
        <a href="/admin" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>Painel Admin →</a>
      </div>

      {loading ? (
        <p>A carregar loja...</p>
      ) : games.length === 0 ? (
        <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', border: '1px solid #ffeeba' }}>
          <p>Nenhum jogo configurado no momento. Aceda ao <a href="/admin">Painel Admin</a> para adicionar o primeiro jogo.</p>
        </div>
      ) : (
        <div style={{ background: '#f9f9f9', padding: '25px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <form onSubmit={handleSubmitOrder}>
            <div style={{ marginBottom: '15px' }}>
              <label>Selecione o Jogo / Servidor:</label><br />
              <select 
                value={selectedGame} 
                onChange={(e) => setSelectedGame(e.target.value)}
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                {games.map((g) => (
                  <option key={g.id} value={g.game_name}>
                    {g.game_name} {g.mode === 'selling' ? '🟢 (Em Stock)' : '🔴 (A Comprar)'}
                  </option>
                ))}
              </select>
            </div>

            {currentGame && (
              <div style={{ marginBottom: '15px', padding: '12px', background: currentGame.mode === 'selling' ? '#e2f0d9' : '#fce4d6', borderRadius: '6px' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>
                  {currentGame.mode === 'selling' 
                    ? `🟢 Estado: A Vender Coins | Stock disponível: ${currentGame.stock_quantity}` 
                    : `🔴 Estado: A Comprar de Jogadores | Procura ativamente coins!`}
                </p>
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label>Quantidade de Coins:</label><br />
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="Ex: 1000" 
                required 
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>O seu Discord / Contacto:</label><br />
              <input 
                type="text" 
                value={contact} 
                onChange={(e) => setContact(e.target.value)} 
                placeholder="Ex: seu_discord#1234" 
                required 
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              style={{ width: '100%', background: '#0070f3', color: '#fff', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
            >
              {submitting ? 'A enviar...' : 'Realizar Pedido'}
            </button>
          </form>
        </div>
      )}
    </main>
  )
}
