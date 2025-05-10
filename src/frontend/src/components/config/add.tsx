'use client';

import { useForm, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { z } from 'zod'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { ComboboxOptions } from '../combobox';

export const sensorDataOptions = [
  'Temperatur',
  'Luftfeuchtigkeit',
  'Luftdruck',
  'Helligkeit',
  'Luftqualität',
] as const;

const baseSchema = z.object({
  sensorID: z
    .string()
    .min(4, { message: 'SensorID besteht aus 4 Hexadezimal-Ziffern' })
    .regex(/^[0-9a-fA-F]{4}$/, {
      message: 'SensorID muss aus validen Hexadezimal-Ziffern bestehen',
    }),
  sensorName: z.string().min(1, { message: 'Sensor-Name ist erforderlich' }),
  sensorDescription: z
    .string()
    .max(500, { message: 'Beschreibung darf maximal 500 Zeichen haben' })
    .optional(),
  location: z.object({
    room: z.string().min(1, { message: 'Installationsraum ist erforderlich' }),
    floor: z.string().min(1, { message: 'Stockwerk ist erforderlich' }),
    description: z.string().optional(),
  }),
  sensorTyp: z.enum(['esp8266', 'esp32'], {
    errorMap: () => ({ message: 'Bitte Sensor-Typ auswählen' }),
  }),
  sensorData: z.array(z.enum([...sensorDataOptions])),
});

const configurationSchema = z.discriminatedUnion('dataType', [
  z.object({
    dataType: z.literal('Temperatur'),
    unit: z.enum(['°C', '°F', 'K']),
    name: z.string().min(1, 'Anzeigename ist erforderlich'),
    beschreibung: z.string().optional(),
    grenzwerte: z
      .array(
        z.object({
          value: z.number(),
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
    beschreibung: z.string().optional(),
    grenzwerte: z
      .array(
        z.object({
          value: z.number(),
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
    referenzHöhe: z.number(),
    einheit: z.enum(['hPa', 'kPa', 'mmHg']),
  }),
  z.object({
    dataType: z.literal('Helligkeit'),
    messbereich: z.enum(['0-1000lux', '0-10000lux', 'auto']),
    nachtmodus: z.boolean(),
  }),
  z.object({
    dataType: z.literal('Luftqualität'),
    pollutantTypes: z.array(z.enum(['PM2.5', 'PM10', 'CO2', 'VOC'])),
    kalibrierungsDatum: z.date(),
  }),
]);

const formSchema = baseSchema.extend({
  configurations: z.array(configurationSchema),
});

const frameworks: ComboboxOptions[] = [
  { value: 'esp8266', label: 'ESP8266' },
  { value: 'esp32', label: 'ESP32' },
];


type ConfigurationFieldsProps = {
  dataType: typeof sensorDataOptions[number];
  index: number;
};

export const ConfigurationFields = ({ dataType, index }: ConfigurationFieldsProps) => {
  const { control, getValues, setValue } = useFormContext();

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema) as any,
      defaultValues: {
        sensorID: '',
        sensorName: '',
        sensorDescription: '',
        location: {
          room: '',
          floor: '',
          description: '',
        },
        sensorTyp: undefined,
        sensorData: [],
        configurations: [],
      },
      mode: 'onChange',
    });

  switch (dataType) {
    case 'Temperatur':
      return (
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium">Temperatur Konfiguration</h3>
          <div className="space-y-4">
            <FormField
              control={control}
              name={`configurations.${index}.unit`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Einheit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value as string | undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Einheit wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {['°C', '°F', 'K'].map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`configurations.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Anzeigename" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`configurations.${index}.beschreibung`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung</FormLabel>
                  <FormControl>
                    <Input placeholder="Optionale Beschreibung" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

              <div className="space-y-4">
                <FormLabel>Grenzwerte</FormLabel>
                {form
                  .watch(`configurations.${index}.grenzwerte`)
                  ?.map((_, thresholdIndex) => (
                    <div
                      key={thresholdIndex}
                      className="space-y-2 border p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">
                          Grenzwert #{thresholdIndex + 1}
                        </h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const current = form.getValues(
                              `configurations.${index}.grenzwerte`
                            );
                            form.setValue(
                              `configurations.${index}.grenzwerte`,
                              current?.filter((_, i) => i !== thresholdIndex)
                            );
                          }}
                        >
                          Entfernen
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name={`configurations.${index}.grenzwerte.${thresholdIndex}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wert</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`configurations.${index}.grenzwerte.${thresholdIndex}.color`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Farbe</FormLabel>
                            <FormControl>
                              <Input
                                type="color"
                                {...field}
                                className="w-20 h-10"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`configurations.${index}.grenzwerte.${thresholdIndex}.alert.send`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-4">
                            <FormLabel>Alert senden:</FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`configurations.${index}.grenzwerte.${thresholdIndex}.alert.critical`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-4">
                            <FormLabel>Kritischer Alarm:</FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`configurations.${index}.grenzwerte.${thresholdIndex}.alert.message`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nachricht</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Alarmnachricht eingeben"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const current =
                      form.getValues(`configurations.${index}.grenzwerte`) ||
                      [];
                    form.setValue(`configurations.${index}.grenzwerte`, [
                      ...current,
                      {
                        value: 0,
                        color: '#CF2430',
                        alert: {
                          send: true,
                          critical: false,
                          message: 'Temperaturgrenzwert erreicht',
                        },
                      },
                    ]);
                  }}
                >
                  + Grenzwert hinzufügen
                </Button>
              </div>
            </div>
          </div>
        );
    case 'Luftfeuchtigkeit':
      return (
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium">Luftfeuchtigkeit Konfiguration</h3>
          <FormField
            control={control}
            name={`configurations.${index}.unit`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Einheit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value as string | undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Einheit wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {['g/m³', '%'].map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`configurations.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Anzeigename" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`configurations.${index}.beschreibung`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beschreibung</FormLabel>
                <FormControl>
                  <Input placeholder="Optionale Beschreibung" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

            {/* Thresholds section */}
            <div className="space-y-4">
              <FormLabel>Grenzwerte</FormLabel>
              {form
                .watch(`configurations.${index}.grenzwerte`)
                ?.map((_, thresholdIndex) => (
                  <div
                    key={thresholdIndex}
                    className="space-y-2 border p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">
                        Grenzwert #{thresholdIndex + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const current = form.getValues(
                            `configurations.${index}.grenzwerte`
                          );
                          form.setValue(
                            `configurations.${index}.grenzwerte`,
                            current?.filter((_, i) => i !== thresholdIndex)
                          );
                        }}
                      >
                        Entfernen
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`configurations.${index}.grenzwerte.${thresholdIndex}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wert</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`configurations.${index}.grenzwerte.${thresholdIndex}.color`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farbe</FormLabel>
                          <FormControl>
                            <Input
                              type="color"
                              {...field}
                              className="w-20 h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                      <FormField
                        control={form.control}
                        name={`configurations.${index}.grenzwerte.${thresholdIndex}.alert.send`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-4">
                            <FormLabel>Alert senden:</FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`configurations.${index}.grenzwerte.${thresholdIndex}.alert.critical`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-4">
                            <FormLabel>Kritischer Alarm:</FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`configurations.${index}.grenzwerte.${thresholdIndex}.alert.message`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nachricht</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Alarmnachricht eingeben"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const current =
                    form.getValues(`configurations.${index}.grenzwerte`) || [];
                  form.setValue(`configurations.${index}.grenzwerte`, [
                    ...current,
                    {
                      value: 0,
                      color: '#006FEE',
                      alert: {
                        send: true,
                        critical: false,
                        message: 'Luftfeuchtigkeits-Grenzwert erreicht',
                      },
                    },
                  ]);
                }}
              >
                + Grenzwert hinzufügen
              </Button>
            </div>
          </div>
        );

    case 'Luftdruck':
      return <div>Luftdruck</div>;
    case 'Helligkeit':
      return <div>Helligkeit</div>;
    case 'Luftqualität':
      return <div>Luftqualität</div>;
    default:
      return null;
  }
};