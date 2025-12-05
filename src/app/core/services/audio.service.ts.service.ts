import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio: HTMLAudioElement | null = null;
  private isEnabled = true;

  constructor() {
    this.loadSettings();
  }

  /**
   * Reproduce una alerta sonora
   * @param soundType - Tipo de sonido a reproducir
   */
  public playAlert(soundType: 'order' | 'success' | 'error' | 'warning' = 'order'): void {
    if (!this.isEnabled) return;

    // Detener sonido anterior si existe
    this.stopAlert();

    try {
      // Opción 1: Usar archivo de audio personalizado
      // this.audio = new Audio(`/assets/sounds/${soundType}-alert.mp3`);
      
      // Opción 2: Generar tono con Web Audio API (no requiere archivos)
      this.playBeep(soundType);
      
      // Opción 3: Usar API de Speech Synthesis (voz)
      // this.speak('Nueva orden asignada');
      
    } catch (error) {
      console.error('Error al reproducir sonido:', error);
    }
  }

  /**
   * Genera un tono usando Web Audio API
   */
  private playBeep(type: string): void {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Configurar frecuencias según el tipo
    const frequencies = {
      order: [880, 1046, 1318], // Notas La, Do, Mi (acorde alegre)
      success: [523, 659, 784], // Notas Do, Mi, Sol
      error: [392, 349], // Notas Sol, Fa (descendente)
      warning: [440, 440, 440], // Nota La repetida
    };

    const freq = frequencies[type as keyof typeof frequencies] || frequencies.order;
    const duration = 0.15; // 150ms por nota
    let startTime = audioContext.currentTime;

    freq.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine'; // Tipo de onda: sine, square, sawtooth, triangle

      // Envelope para suavizar el sonido
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);

      startTime += duration + 0.05; // Pequeña pausa entre notas
    });
  }

  /**
   * Usa la API de Speech Synthesis para hablar
   */
  private speak(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.2;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }

  /**
   * Detiene el sonido actual
   */
  public stopAlert(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    
    // Detener speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Habilita o deshabilita los sonidos
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.saveSettings();
  }

  /**
   * Verifica si los sonidos están habilitados
   */
  public isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Guarda la configuración en localStorage
   */
  private saveSettings(): void {
    localStorage.setItem('audio_enabled', JSON.stringify(this.isEnabled));
  }

  /**
   * Carga la configuración desde localStorage
   */
  private loadSettings(): void {
    const saved = localStorage.getItem('audio_enabled');
    if (saved !== null) {
      this.isEnabled = JSON.parse(saved);
    }
  }

  /**
   * Reproduce un patrón de sonido personalizado
   */
  public playPattern(pattern: number[]): void {
    if (!this.isEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    let startTime = audioContext.currentTime;

    pattern.forEach((frequency) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.2);

      startTime += 0.25;
    });
  }
}