import { z } from 'zod';

export const sensorDataOptions = [
  'Temperatur',
  'Luftfeuchtigkeit',
  'Luftdruck',
  'Helligkeit',
  'Luftqualität',
] as const;

export const baseSchema = z.object({
  sensorID: z
    .string()
    .min(4, { message: 'SensorID besteht aus 4 Hexadezimal-Ziffern' })
    .regex(/^[0-9a-fA-F]{4}$/, {
      message: 'SensorID muss aus validen Hexadezimal-Ziffern bestehen',
    }),
  sensorTyp: z.string({
      errorMap: () => ({ message: 'Bitte Sensor-Typ auswählen' }),
    }).min(1),
  sensorName: z.string().min(1, { message: 'Sensor-Name ist erforderlich' }),
  sensorDescription: z
    .string()
    .max(500, { message: 'description darf maximal 500 Zeichen haben' })
    .optional(),
  location: z.object({
    room: z.string().min(1, { message: 'Installationsraum ist erforderlich' }),
    floor: z.string().min(1, { message: 'Stockwerk ist erforderlich' }),
    description: z.string().optional(),
  }),
  sensorData: z.array(z.enum([...sensorDataOptions])),
});

export const configurationSchema = z.discriminatedUnion('dataType', [
  z.object({
    dataType: z.literal('Temperatur'),
    unit: z.enum(['°C', '°F', 'K']),
    name: z.string().min(1, 'Anzeigename ist erforderlich'),
    description: z.string().optional(),
    maxAgeHours: z.number().min(1, 'Maximales Alter (Stunden) ist erforderlich').default(24),
    grenzwerte: z
      .array(
        z.object({
          value: z.number(),
          condition: z
            .enum(['über', 'gleich', 'unter'], {
              message: 'Bitte Bedingung auswählen',
            })
            .default('über'),
          color: z
            .string()
            .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Ungültige Hex-Farbe'),
          alert: z.object({
            send: z.boolean().default(true),
            critical: z.boolean().default(false),
            message: z.string().min(5, 'Mindestens 5 Zeichen erforderlich'),
          }),
        })
      )
      .optional(),
  }),
  z.object({
    dataType: z.literal('Luftfeuchtigkeit'),
    unit: z.enum(['g/m³', '%']),
    name: z.string().min(1, 'Anzeigename ist erforderlich'),
    description: z.string().optional(),
    maxAgeHours: z.number().min(1, 'Maximales Alter (Stunden) ist erforderlich').default(24),
    grenzwerte: z
      .array(
        z.object({
          value: z.number(),
          condition: z
            .enum(['über', 'gleich', 'unter'], {
              message: 'Bitte Bedingung auswählen',
            })
            .default('über'),
          color: z
            .string()
            .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Ungültige Hex-Farbe'),
          alert: z.object({
            send: z.boolean().default(true),
            critical: z.boolean().default(false),
            message: z.string().min(5, 'Mindestens 5 Zeichen erforderlich'),
          }),
        })
      )
      .optional(),
  }),
  z.object({
    dataType: z.literal('Luftdruck'),
    unit: z.enum(['hPa', 'kPa', 'bar']),
    name: z.string().min(1, 'Anzeigename ist erforderlich'),
    description: z.string().optional(),
    maxAgeHours: z.number().min(1, 'Maximales Alter (Stunden) ist erforderlich').default(24),
    grenzwerte: z
      .array(
        z.object({
          value: z.number(),
          condition: z
            .enum(['über', 'gleich', 'unter'], {
              message: 'Bitte Bedingung auswählen',
            })
            .default('über'),
          color: z
            .string()
            .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Ungültige Hex-Farbe'),
          alert: z.object({
            send: z.boolean().default(true),
            critical: z.boolean().default(false),
            message: z.string().min(5, 'Mindestens 5 Zeichen erforderlich'),
          }),
        })
      )
      .optional(),
  }),
  z.object({
    dataType: z.literal('Helligkeit'),
    unit: z.enum(['lux', 'cd/m²', 'fL']),
    name: z.string().min(1, 'Anzeigename ist erforderlich'),
    description: z.string().optional(),
    maxAgeHours: z.number().min(1, 'Maximales Alter (Stunden) ist erforderlich').default(24),
    grenzwerte: z
      .array(
        z.object({
          value: z.number(),
          condition: z
            .enum(['über', 'gleich', 'unter'], {
              message: 'Bitte Bedingung auswählen',
            })
            .default('über'),
          color: z
            .string()
            .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Ungültige Hex-Farbe'),
          alert: z.object({
            send: z.boolean().default(true),
            critical: z.boolean().default(false),
            message: z.string().min(5, 'Mindestens 5 Zeichen erforderlich'),
          }),
        })
      )
      .optional(),
  }),
  z.object({
    dataType: z.literal('Luftqualität'),
    unit: z.enum(['PM2.5', 'PM10', 'CO2', 'VOC']),
    name: z.string().min(1, 'Anzeigename ist erforderlich'),
    description: z.string().optional(),
    maxAgeHours: z.number().min(1, 'Maximales Alter (Stunden) ist erforderlich').default(24),
    grenzwerte: z
      .array(
        z.object({
          value: z.number(),
          condition: z
            .enum(['über', 'gleich', 'unter'], {
              message: 'Bitte Bedingung auswählen',
            })
            .default('über'),
          color: z
            .string()
            .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Ungültige Hex-Farbe'),
          alert: z.object({
            send: z.boolean().default(true),
            critical: z.boolean().default(false),
            message: z.string().min(5, 'Mindestens 5 Zeichen erforderlich'),
          }),
        })
      )
      .optional(),
  }),
]);

export const formSchema = baseSchema.extend({
  configurations: z.array(configurationSchema),
});

export type SensorFormValues = z.infer<typeof formSchema>;