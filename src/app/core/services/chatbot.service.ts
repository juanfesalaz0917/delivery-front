import { Injectable } from '@angular/core';
import { environment } from '../../environment';
import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private readonly ai = new GoogleGenAI({ apiKey: environment.geminiApiKey });

  async sendMessage(message: string): Promise<any> {
    const prompt = `
    <rol>
      Eres un asistente virtual para una plataforma de gestión de domicilios en moto.
      Tu función es ayudar a los usuarios a navegar y utilizar el sistema.

      Información del sistema:
      - Restaurantes: Puedes gestionar restaurantes en el módulo "Restaurantes"
      - Productos: Administra productos en el módulo "Productos"
      - Menús: Asocia productos con restaurantes en "Menús"
      - Clientes: Gestiona clientes en el módulo "Clientes"
      - Pedidos: Crea y rastrea pedidos en "Pedidos" - incluye mapa de seguimiento en tiempo real
      - Conductores: Administra conductores en el módulo "Conductores"
      - Motocicletas: Gestiona motos en "Motocicletas"
      - Turnos: Asigna conductores a motos en "Turnos"
      - Inconvenientes: Registra problemas de motos en "Inconvenientes"
      - Análisis: Visualiza estadísticas en el "Dashboard de Análisis"

      Responde de manera amigable, concisa y en español. Si no sabes algo, admítelo honestamente.
    </rol>
    <ejemplo>
      Usuario: ¿Cómo puedo registrar un nuevo restaurante?
      Asistente: Para registrar un nuevo restaurante, ve al módulo "Restaurantes" y haz clic en "Agregar Nuevo". Completa el formulario con la información requerida y guarda los cambios.
    </ejemplo>
    <exclude>
      - No proporciones información técnica sobre la implementación del sistema.
      - No respondas en inglés.
      - No inventes funcionalidades que no existen en el sistema.
      - No uses otro formato que no sea texto plano.
    </exclude>
    <mensaje>
      Usuario: ${message}
    </mensaje>
`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  }

  getFrequentQuestions(): { question: string; answer: string }[] {
    return [
      {
        question: '¿Para qué sirve este sistema?',
        answer:
          'Este sistema gestiona domicilios en moto, permitiendo coordinar restaurantes, productos, pedidos, conductores y motocicletas de forma eficiente.',
      },
      {
        question: '¿Dónde puedo registrar un nuevo conductor?',
        answer:
          'Puedes registrar un nuevo conductor en el módulo "Conductores" desde el menú lateral.',
      },
      {
        question: '¿En qué parte puedo realizar un pedido?',
        answer:
          'Los pedidos se crean en el módulo "Pedidos", donde puedes asociar clientes con productos del menú.',
      },
      {
        question: '¿Cómo rastrea el sistema las entregas?',
        answer:
          'El sistema incluye un mapa interactivo en el módulo de Pedidos que muestra la ubicación en tiempo real de las motocicletas.',
      },
      {
        question: '¿Cómo asigno una moto a un conductor?',
        answer:
          'Utiliza el módulo "Turnos" para asignar conductores a motocicletas con fecha y hora específicas.',
      },
    ];
  }
}
