// src/components/CountdownTimer.tsx
'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  targetDate: Date
  label: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const [isClient, setIsClient] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Détecter quand le composant est côté client
  useEffect(() => {
    setIsClient(true)
    setTimeLeft(calculateTimeLeft(targetDate))
  }, [targetDate])

  useEffect(() => {
    if (!isClient) return

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, isClient])

  function calculateTimeLeft(targetDate: Date): TimeLeft {
    const difference = targetDate.getTime() - Date.now()
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    }
  }

  // Ne rien afficher côté serveur ou pendant l'hydratation
  if (!isClient) {
    return (
      <div className="text-center">
        <p className="text-sm font-medium text-gray-800 mb-2">{label}</p>
        <div className="flex justify-center space-x-2">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-indigo-600">--</span>
            <span className="text-xs text-gray-600">heures</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-indigo-600">--</span>
            <span className="text-xs text-gray-600">min</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-indigo-600">--</span>
            <span className="text-xs text-gray-600">sec</span>
          </div>
        </div>
      </div>
    )
  }

  // Si le temps est écoulé
  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return (
      <div className="text-center">
        <span className="text-sm font-medium text-gray-800">⌛ Terminé</span>
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="text-sm font-medium text-gray-800 mb-2">{label}</p>
      <div className="flex justify-center space-x-2">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-indigo-600">{timeLeft.days}</span>
            <span className="text-xs text-gray-600">jours</span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-indigo-600">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-xs text-gray-600">heures</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-indigo-600">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-xs text-gray-600">min</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-indigo-600">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-xs text-gray-600">sec</span>
        </div>
      </div>
    </div>
  )
}