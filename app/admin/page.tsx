'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface GameConfig {
  id: number
  game_name: string
  mode: string
  stock_quantity: number
}

export default function AdminPage() {
  const [games, setGames] = useState<GameConfig[]>([])
  const [loading, setLoading] = useState(false)

  // Buscar todos os jogos
  const fetchGames = async () => {
    const { data } = await supabase.from('site_config').select('*').order('id')
    if (data) setGames(data)
  }

  useEffect(() => {
    fetchGames()
  }, [])

  // Atualizar estoque ou modo no Supabase
  const handleUpdate = async (id: number, newMode: string, newStock: number) => {
    setLoading(true)
    const { error } = await supabase
      .from('site_config')
      .update({ mode: newMode, stock_quantity: newStock })
      .eq('id', id)

    if (error) {
      alert('Erro ao atualizar!')
    } else {
      alert('Atualizado com sucesso!')
      fetchGames()
    }
    setLoading(false)
  }

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Painel Administrativo - Estoque de Coins</h1>
      <p>Gerencie o status e o estoque de cada jogo em tempo real.</p>
      
      <div style={{ marginTop: '20px' }}>
        {games.map((game) => (
          <GameRow key={game.id} game={game} onUpdate={handleUpdate} loading={loading} />
        ))}
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <a href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>← Voltar para o Site Principal</a>
      </div>
    </main>
  )
}

// Componente auxiliar para cada linha de jogo
function GameRow({ game, onUpdate, loading }: { game: GameConfig, onUpdate: any, loading: boolean }) {
  const [mode, setMode] = useState(game.mode)
  const [stock, setStock] = useState(game.stock_quantity)

  // Atualiza os estados locais se mudarem no banco
  useEffect(() => {
    setMode(game.mode)
    setStock(game.stock_quantity)
  }, [game])

  return (
    <div style={{ background: '#f9f9f9', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
      <div>
        <h3 style={{ margin: '0 0 5px 0' }}>{game.game_name}</h3>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '12px', display: 'block' }}>Modo:</label>
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value)}
            style={{ padding: '5px' }}
          >
            <option value="selling">🟢 Vendendo</option>
            <option value="buying">🔴 Comprando (Sem Estoque)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '12px', display: 'block' }}>Estoque:</label>
          <input 
            type="number" 
            value={stock} 
            onChange={(e) => setStock(Number(e.target.value))}
            style={{ width: '80px', padding: '5px' }}
          />
        </div>

        <button 
          onClick={() => onUpdate(game.id, mode, stock)}
          disabled={loading}
          style={{ background: '#28a745', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', marginTop: '15px' }}
        >
          Salvar
        </button>
      </div>
    </div>
  )
}