interface CIE10Result {
  id: string;
  title: string;
  definition?: string;
  inclusion?: string;
  exclusion?: string;
}

interface CIE10SearchResponse {
  destinationEntities: CIE10Result[];
  totalCount: number;
}

class CIE10Service {
  private baseUrl = 'https://icd.who.int/icd10';

  async searchDiagnosis(query: string): Promise<CIE10Result[]> {
    try {
      if (!query || query.length < 3) {
        return [];
      }

      // Usar el API oficial del CIE10
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}&propertiesToBeSearched=Title&useFlexisearch=true&flatResults=true&highlightingEnabled=false`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'es',
          'API-Version': 'v2'
        }
      });

      if (!response.ok) {
        console.error('CIE10 API response:', response.status, response.statusText);
        throw new Error(`Error al consultar CIE10: ${response.status}`);
      }

      const data: CIE10SearchResponse = await response.json();
      return data.destinationEntities || [];
    } catch (error) {
      console.error('Error consultando CIE10:', error);
      return [];
    }
  }

  private getFallbackDiagnoses(query: string): CIE10Result[] {
    // Lista de diagnósticos comunes y específicos como fallback
    const commonDiagnoses = [
      // Enfermedades infecciosas
      { id: 'A00-B99', title: 'Ciertas enfermedades infecciosas y parasitarias' },
      { id: 'A15-A19', title: 'Tuberculosis respiratoria' },
      { id: 'A50-A64', title: 'Infecciones de transmisión sexual' },
      
      // Neoplasias
      { id: 'C00-D49', title: 'Neoplasias' },
      { id: 'C00-C14', title: 'Neoplasias malignas de labio, cavidad bucal y faringe' },
      { id: 'C15-C26', title: 'Neoplasias malignas de órganos digestivos' },
      { id: 'C30-C39', title: 'Neoplasias malignas de órganos respiratorios e intratorácicos' },
      { id: 'C50', title: 'Neoplasia maligna de mama' },
      { id: 'C61', title: 'Neoplasia maligna de próstata' },
      
      // Enfermedades endocrinas
      { id: 'E00-E89', title: 'Enfermedades endocrinas, nutricionales y metabólicas' },
      { id: 'E10-E14', title: 'Diabetes mellitus' },
      { id: 'E65-E68', title: 'Obesidad y otros tipos de hiperalimentación' },
      
      // Trastornos mentales
      { id: 'F00-F99', title: 'Trastornos mentales, del comportamiento y del desarrollo neurológico' },
      { id: 'F32', title: 'Episodio depresivo' },
      { id: 'F41', title: 'Otros trastornos de ansiedad' },
      
      // Enfermedades del sistema nervioso
      { id: 'G00-G99', title: 'Enfermedades del sistema nervioso' },
      { id: 'G40', title: 'Epilepsia' },
      { id: 'G93.1', title: 'Lesión cerebral anóxica' },
      
      // Enfermedades circulatorias
      { id: 'I00-I99', title: 'Enfermedades del sistema circulatorio' },
      { id: 'I10-I15', title: 'Enfermedades hipertensivas' },
      { id: 'I20-I25', title: 'Enfermedades isquémicas del corazón' },
      { id: 'I60-I69', title: 'Enfermedades cerebrovasculares' },
      
      // Enfermedades respiratorias
      { id: 'J00-J99', title: 'Enfermedades del sistema respiratorio' },
      { id: 'J00-J06', title: 'Infecciones agudas de las vías respiratorias superiores' },
      { id: 'J40-J47', title: 'Enfermedades crónicas de las vías respiratorias inferiores' },
      { id: 'J45', title: 'Asma' },
      
      // Enfermedades digestivas
      { id: 'K00-K95', title: 'Enfermedades del sistema digestivo' },
      { id: 'K25-K28', title: 'Úlcera gástrica y duodenal' },
      { id: 'K70-K77', title: 'Enfermedades del hígado' },
      
      // Enfermedades de la piel
      { id: 'L00-L99', title: 'Enfermedades de la piel y del tejido subcutáneo' },
      { id: 'L20-L30', title: 'Dermatitis y eczema' },
      
      // Enfermedades osteomusculares
      { id: 'M00-M99', title: 'Enfermedades del sistema osteomuscular y del tejido conectivo' },
      { id: 'M15-M19', title: 'Artrosis' },
      { id: 'M79.3', title: 'Ciática' },
      
      // Enfermedades genitourinarias
      { id: 'N00-N99', title: 'Enfermedades del sistema genitourinario' },
      { id: 'N10-N16', title: 'Enfermedades tubulointersticiales del riñón' },
      { id: 'N18', title: 'Insuficiencia renal crónica' },
      
      // Embarazo
      { id: 'O00-O9A', title: 'Embarazo, parto y puerperio' },
      { id: 'O80-O84', title: 'Parto' },
      
      // Síntomas y signos
      { id: 'R00-R99', title: 'Síntomas, signos y hallazgos anormales clínicos y de laboratorio' },
      { id: 'R50', title: 'Fiebre de origen desconocido' },
      { id: 'R51', title: 'Cefalea' },
      { id: 'R52', title: 'Dolor no clasificado en otra parte' },
      
      // Traumatismos
      { id: 'S00-T88', title: 'Traumatismos, envenenamientos y algunas otras consecuencias de causas externas' },
      { id: 'S00-S09', title: 'Traumatismos de la cabeza' },
      { id: 'S20-S29', title: 'Traumatismos del tórax' },
      { id: 'S30-S39', title: 'Traumatismos del abdomen, región lumbosacra, columna lumbosacra y pelvis' },
      
      // Factores de salud
      { id: 'Z00-Z99', title: 'Factores que influyen en el estado de salud y contacto con los servicios de salud' },
      { id: 'Z00', title: 'Examen médico general' },
      { id: 'Z01', title: 'Otros exámenes médicos y consultas' }
    ];

    // Filtrar diagnósticos que contengan la consulta
    const filtered = commonDiagnoses.filter(diagnosis => 
      diagnosis.title.toLowerCase().includes(query.toLowerCase()) ||
      diagnosis.id.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.map(diagnosis => ({
      id: diagnosis.id,
      title: diagnosis.title,
      definition: `Diagnóstico CIE10: ${diagnosis.id} - ${diagnosis.title}`
    }));
  }

  async getDiagnosisById(id: string): Promise<CIE10Result | null> {
    try {
      const response = await fetch(`${this.baseUrl}/entity/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'es',
          'API-Version': 'v2'
        }
      });

      if (!response.ok) {
        console.error('CIE10 API response:', response.status, response.statusText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo diagnóstico CIE10:', error);
      return null;
    }
  }
}

export const cie10Service = new CIE10Service();
export type { CIE10Result }; 