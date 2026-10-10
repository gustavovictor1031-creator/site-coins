'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Validação blindada para a build da Vercel nunca quebrar
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

export default function Home() {
  const [games, setGames] = useState<GameConfig[]>([])
  const [selectedGame, setSelectedGame] = useState<string>('Pokepixel')
  const [currentGameData, setCurrentGameData] = useState<GameConfig | null>(null)
  
  const [contact, setContact] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchGames() {
      // Se estivermos usando o placeholder na build, não tenta buscar do banco para evitar erro de rede
      if (supabaseUrl.includes('placeholder')) return

      const { data, error } = await supabase.from('site_config').select('*')
      if (data && data.length > 0) {
        setGames(data)
        setCurrentGameData(data[0])
        setSelectedGame(data[0].game_name)
      }
    }
    fetchGames()
  }, [])

  const handleGameChange = (gameName: string) => {
    setSelectedGame(gameName)
    const found = games.find(g => g.game_name === gameName)
    if (found) setCurrentGameData(found)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentGameData) return
    setLoading(true)

    const { error } = await supabase.from('transactions').insert([
      {
        game_name: selectedGame,
        type: currentGameData.mode === 'selling' ? 'sale' : 'purchase',
        amount: Number(amount),
        price: Number(amount) * 1.5,
        user_contact: contact
      }
    ])

    if (error) {
      alert('Erro ao processar transação!')
    } else {
      alert(`Sucesso! Sua solicitação para ${selectedGame} foi registrada.`)
      setContact('')
      setAmount('')
    }
    setLoading(false)
  }

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Loja Automatizada de Coins</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label><strong>Selecione o Jogo / Servidor:</strong></label><br />
        <select 
          value={selectedGame} 
          onChange={(e) => handleGameChange(e.target.value)}
          style={{ width: '100%', padding: '10px', marginTop: '5px', fontSize: '16px', borderRadius: '5px' }}
        >
          {games.map((g) => (
            <option key={g.id} value={g.game_name}>{g.game_name}</option>
          ))}
        </select>
      </div>

      {currentGameData && (
        <>
          <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <p><strong>Status para {selectedGame}:</strong> {currentGameData.mode === 'selling' ? '🟢 Vendendo Coins' : '🔴 Estoque Esgotado - Comprando de Usuários'}</p>
            <p><strong>Estoque Disponível:</strong> {currentGameData.stock_quantity} coins</p>
          </div>

          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h2>{currentGameData.mode === 'selling' ? `Comprar Coins - ${selectedGame}` : `Vender Coins para Nós - ${selectedGame}`}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label>Quantidade de Coins:</label><br />
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Seu Contato (Discord / WhatsApp):</label><br />
                <input 
                  type="text" 
                  value={contact} 
                  onChange={(e) => setContact(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ background: '#0070f3', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
              >
                {loading ? 'Processando...' : (currentGameData.mode === 'selling' ? 'Comprar Agora' : 'Oferecer Coins')}
              </button>
            </form>
          </div>
        </>
      )}
    </main>
  )
}