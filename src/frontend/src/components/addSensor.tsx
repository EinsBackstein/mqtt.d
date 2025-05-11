'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/mutliselect';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useEffect, useState } from 'react';
import { Combobox, ComboboxOptions } from '@/components/combobox';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChevronLeft, ChevronRight, Equal } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const sensorDataOptions = [
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
    einheit: z.enum(['hPa', 'kPa', 'bar']),
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
    dataType: z.literal('Helligkeit'),
    referenzHöhe: z.number().optional(), // Sensor height in meters (optional)
    einheit: z.enum(['lux', 'cd/m²', 'fL']), // Lux, Candela/m², Foot-Lamberts
    name: z.string().min(1, 'Anzeigename ist erforderlich'),
    beschreibung: z.string().optional(),
    messbereich: z
      .tuple([z.number(), z.number()]) // Measurement range [min, max]
      .optional()
      .refine((range) => {
        const [min, max] = range ?? [0, 0];
        return min <= max;
      }, 'Minimalwert muss <= Maximalwert sein'),
    sensorTyp: z.enum(['ambient', 'direkt', 'infrarot', 'UV']).optional(),
    spektralbereich: z.string().optional(), // Spectral range (e.g., "400-700nm")
    grenzwerte: z
      .array(
        z.object({
          value: z.number(),
          condition: z.enum(['über', 'gleich', 'unter'],{message:"Bitte Bedingung auswählen"}).default('über'), // Threshold condition
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
    kalibrierungsdatum: z.date().optional(), // Calibration date
    nachtsichtfähig: z.boolean().default(false).optional(),
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

export function SensorForm() {
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
      sensorData: ['Helligkeit'],
      configurations: [],
    },
    mode: 'onChange',
  });

  const handleAppendGroup = (label: ComboboxOptions['label']) => {
    const newFlameWork = {
      value: label,
      label,
    };
    frameworks.push(newFlameWork);
    setSelectedFlameWork(newFlameWork);
  };

  const selectedSensorData = form.watch('sensorData');
  const [selectedFlameWork, setSelectedFlameWork] = useState<ComboboxOptions>();

  useEffect(() => {
    const currentConfigs = form.getValues('configurations');
    const newConfigs = selectedSensorData.map((dataType) => {
      const existing = currentConfigs.find((c) => c.dataType === dataType);
      return existing || ({ dataType } as any);
    });
    form.setValue('configurations', newConfigs);
  }, [selectedSensorData, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  function handleSelect(option: ComboboxOptions) {
    setSelectedFlameWork(option);
    form.setValue('sensorTyp', option.value as 'esp8266' | 'esp32');
  }

  const renderConfigurationFields = (
    dataType: (typeof sensorDataOptions)[number],
    index: number
  ) => {
    switch (dataType) {
      case 'Temperatur':
        return (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">Temperatur Konfiguration</h3>
            <div className="space-y-4">
              {/* Existing unit field */}

              <FormField
                control={form.control}
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
                control={form.control as any}
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

              {/* Description field */}
              <FormField
                control={form.control}
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
              control={form.control}
              name={`configurations.${index}.einheit`}
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
              control={form.control as any}
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

            {/* Description field */}
            <FormField
              control={form.control}
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
        return (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">Luftdruck Konfiguration</h3>
            <div className="space-y-4">
              {/* Existing unit field */}

              <FormField
                control={form.control}
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
                        {['hPa', 'kPa', 'bar'].map((unit) => (
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
                control={form.control as any}
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

              {/* Description field */}
              <FormField
                control={form.control}
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
                          message: 'Luftdruck-Grenzwert erreicht',
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

      case 'Helligkeit':
        return (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">Helligkeit Konfiguration</h3>
            <div className="space-y-4">
              {/* Unit selection */}
              <FormField
                control={form.control}
                name={`configurations.${index}.einheit`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Einheit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Einheit wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {['lux', 'cd/m²', 'fL'].map((unit) => (
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

              {/* Name field */}
              <FormField
                control={form.control}
                name={`configurations.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anzeigename</FormLabel>
                    <FormControl>
                      <Input placeholder="Sensorbezeichnung" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description field */}
              <FormField
                control={form.control}
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

              {/* Measurement range */}
              <FormField
                control={form.control}
                name={`configurations.${index}.messbereich`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Messbereich (lx)</FormLabel>
                    <div className="flex gap-4">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Minimalwert"
                          value={field.value?.[0] || ''}
                          onChange={(e) => {
                            const newVal = [...(field.value || [0, 0])];
                            newVal[0] = Number(e.target.value);
                            field.onChange(newVal);
                          }}
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Maximalwert"
                          value={field.value?.[1] || ''}
                          onChange={(e) => {
                            const newVal = [...(field.value || [0, 0])];
                            newVal[1] = Number(e.target.value);
                            field.onChange(newVal);
                          }}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sensor type */}
              <FormField
                control={form.control}
                name={`configurations.${index}.sensorTyp`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sensor Typ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sensorart wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {['ambient', 'direkt', 'infrarot', 'UV'].map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Spectral range */}
              <FormField
                control={form.control}
                name={`configurations.${index}.spektralbereich`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spektralbereich (nm)</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. 400-700" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Calibration date */}
              <FormField
                control={form.control}
                name={`configurations.${index}.kalibrierungsdatum`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kalibrierungsdatum</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value
                            ? field.value.toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Night vision capability */}
              <FormField
                control={form.control}
                name={`configurations.${index}.nachtsichtfähig`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-4">
                    <FormLabel>Nachtsichtfähig:</FormLabel>
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

                      {/* Threshold condition */}
<FormField
  control={form.control}
  name={`configurations.${index}.grenzwerte.${thresholdIndex}.condition`}
  render={({ field }) => (
    <FormItem>
      <FormLabel>Bedingung</FormLabel>
      <ToggleGroup 
        type="single" 
        size="sm"
        value={field.value}
        onValueChange={field.onChange}
        className="flex"
      >
        {/* Über Condition */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="über"
                aria-label="Über"
                aria-checked={field.value === 'über'}
                className="aria-checked:bg-accent"
              >
                <ChevronRight className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bedingung: Über</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Gleich Condition */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="gleich"
                aria-label="Gleich"
                aria-checked={field.value === 'gleich'}
                className="aria-checked:bg-accent"
              >
                <Equal className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bedingung: Gleich</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Unter Condition */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="unter"
                aria-label="Unter"
                aria-checked={field.value === 'unter'}
                className="aria-checked:bg-accent"
              >
                <ChevronLeft className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bedingung: Unter</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ToggleGroup>
      <FormMessage />
    </FormItem>
  )}
/>
                      {/* Rest of threshold fields (same as temperature but with updated messages) */}
                      {/* ... (value, color, alert fields similar to temperature example) ... */}
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
                      ...current.map((item) => ({
                        ...item,
                        condition: 'über', // Default condition set explicitly
                      })),
                      {
                        value: 0,
                        condition: 'über',
                        color: '#FFD700', // Different default color
                        alert: {
                          send: true,
                          critical: false,
                          message: 'Helligkeitsgrenzwert überschritten',
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

      case 'Luftqualität':
        return <div>Luftqualität</div>;

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
            e.preventDefault(); // Prevent form submission on input Enter
          }
        }}
        className="w-2/3 px-4 space-y-6"
      >
        {/* Sensor ID */}
        <FormField
          control={form.control}
          name="sensorID"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SensorID</FormLabel>
              <FormControl>
                <InputOTP maxLength={4} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>Eindeutige ID des Sensors</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sensor Type */}
        <FormField
          control={form.control}
          name="sensorTyp"
          render={() => (
            <FormItem>
              <FormLabel>Sensor Typ</FormLabel>
              <Combobox
                options={frameworks}
                placeholder="Sensor Typ auswählen"
                selected={selectedFlameWork?.value ?? ''}
                onChange={handleSelect}
                onCreate={handleAppendGroup}
              />
              <FormDescription>
                Wählen Sie den Sensortyp aus{' '}
                <Link href="/examples/forms" className="pl-1">
                  Dokumentation
                </Link>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* New Sensor Name Field */}
        <FormField
          control={form.control}
          name="sensorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sensor-Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Geben Sie den Sensor-Namen ein"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Name zur einfacheren Identifikation
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* New Sensor Description Field */}
        <FormField
          control={form.control}
          name="sensorDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sensor-Beschreibung</FormLabel>
              <FormControl>
                <Input
                  placeholder="Beschreiben Sie den Sensor und seinen Zweck"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optionale Beschreibung des Sensors
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* New Location Field */}
        <FormField
          control={form.control}
          name="location"
          render={() => (
            <FormItem>
              <FormLabel>Standort</FormLabel>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="location.room"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Geben Sie den Installationsraum ein"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Geben Sie das Installationsstockwerk ein"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Optionale Raumbeschreibung"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormDescription>Wo ist der Sensor installiert?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sensor Data Selection */}
        <FormField
          control={form.control}
          name="sensorData"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sensor-Daten</FormLabel>
              <MultiSelect
                options={[...sensorDataOptions]}
                selected={field.value}
                onChange={field.onChange}
                placeholder="Welche Daten stellt der Sensor zur Verfügung?"
              />
              <FormDescription>
                Welche Daten stellt der Sensor zur Verfügung?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dynamic Configurations */}
        {selectedSensorData.map((dataType, index) => (
          <div key={`${dataType}-${index}`}>
            {renderConfigurationFields(dataType, index)}
          </div>
        ))}

        <Button className="w-20" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
