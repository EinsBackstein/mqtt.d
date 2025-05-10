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
import { ConfigurationFields, sensorDataOptions } from './config/add';

// import renderConfigurationFields from './config/add';

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
      sensorData: [],
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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

        {selectedSensorData.map((dataType, index) => (
          <div key={`${dataType}-${index}`}>
            <ConfigurationFields dataType={dataType} index={index} />
          </div>
        ))}

        <Button className="w-20" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
