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
import { useRouter } from 'next/navigation';
import { formSchema, sensorDataOptions } from '@/lib/schema';
const frameworks: ComboboxOptions[] = [
  { value: 'esp8266', label: 'ESP8266' },
  { value: 'esp32', label: 'ESP32' },
];

export function SensorForm() {
  const router = useRouter();
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
      configurations: [
        {
          dataType: 'Temperatur',
          unit: '°C',
          name: '',
          description: '',
          grenzwerte: [
            {
              value: 0,
              condition: 'über',
              color: '#CF2430',
              alert: {
                send: true,
                critical: false,
                message: 'Temperaturgrenzwert überschritten',
              },
            },
          ],
        },
        {
          dataType: 'Luftfeuchtigkeit',
          unit: '%',
          name: '',
          description: '',
          grenzwerte: [
            {
              value: 0,
              condition: 'über',
              color: '#006FEE',
              alert: {
                send: true,
                critical: false,
                message: 'Luftfeuchtigkeitsgrenzwert überschritten',
              },
            },
          ],
        },
        {
          dataType: 'Luftdruck',
          unit: 'hPa',
          name: '',
          description: '',
          grenzwerte: [
            {
              value: 0,
              condition: 'über',
              color: '#00FF00',
              alert: {
                send: true,
                critical: false,
                message: 'Luftdruckgrenzwert überschritten',
              },
            },
          ],
        },
        {
          dataType: 'Helligkeit',
          unit: 'lux',
          name: '',
          description: '',
          grenzwerte: [
            {
              value: 0,
              condition: 'über',
              color: '#FF00FF',
              alert: {
                send: true,
                critical: false,
                message: 'Helligkeitsgrenzwert überschritten',
              },
            },
          ],
        },
        {
          dataType: 'Luftqualität',
          unit: undefined,
          name: '',
          description: '',
          grenzwerte: [
            {
              value: 0,
              condition: 'über',
              color: '#FFFF00',
              alert: {
                send: true,
                critical: false,
                message: 'Luftqualitätsgrenzwert überschritten',
              },
            },
          ],
        }
      ],
    },
    mode: 'onChange',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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

const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      console.log('Form values:', values);
      const response = await fetch('/api/sensors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('Speichern fehlgeschlagen');
      
      router.push('/'); // Optional: Weiterleitung nach Erfolg
    } catch (error) {
      console.error('Error:', error);
    } finally {
    setIsSubmitting(false);
  }
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
                    <FormLabel className="gap-0">
                      Einheit<div className="text-muted-foreground">*</div>
                    </FormLabel>
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
                    <FormLabel className="gap-0">
                      Anzeigename<div className="text-muted-foreground">*</div>
                    </FormLabel>
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
                name={`configurations.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gap-0">Beschreibung</FormLabel>
                    <FormControl>
                      <Input placeholder="Optionale Beschreibung" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Thresholds section */}
              <div className="space-y-4">
                <FormLabel className="gap-0">Grenzwerte</FormLabel>
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
                            <FormLabel className="gap-0">
                              Bedingung
                              <div className="text-muted-foreground">*</div>
                            </FormLabel>
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
                      <FormField
                        control={form.control}
                        name={`configurations.${index}.grenzwerte.${thresholdIndex}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="gap-0">Wert</FormLabel>
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
                            <FormLabel className="gap-0">Farbe</FormLabel>
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
                            <FormLabel className="gap-0">
                              Alert senden:
                            </FormLabel>
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
                            <FormLabel className="gap-0">
                              Kritischer Alarm:
                            </FormLabel>
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
                            <FormLabel className="gap-0">
                              Nachricht
                              <div className="text-muted-foreground">*</div>
                            </FormLabel>
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
                      ...current.map((item) => ({
                        ...item,
                        condition: 'über' as 'über' | 'gleich' | 'unter', // Explicitly cast to union type
                      })),
                      {
                        value: 0,
                        condition: 'über',
                        color: '#CF2430', // Different default color
                        alert: {
                          send: true,
                          critical: false,
                          message: 'Temperaturgrenzwert überschritten',
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
              name={`configurations.${index}.unit`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gap-0">
                    Einheit<div className="text-muted-foreground">*</div>
                  </FormLabel>
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
                  <FormLabel className="gap-0">
                    Anzeigename<div className="text-muted-foreground">*</div>
                  </FormLabel>
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
              name={`configurations.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gap-0">Beschreibung</FormLabel>
                  <FormControl>
                    <Input placeholder="Optionale Beschreibung" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Thresholds section */}
            <div className="space-y-4">
              <FormLabel className="gap-0">Grenzwerte</FormLabel>
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
                          <FormLabel className="gap-0">
                            Bedingung
                            <div className="text-muted-foreground">*</div>
                          </FormLabel>
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
                    <FormField
                      control={form.control}
                      name={`configurations.${index}.grenzwerte.${thresholdIndex}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="gap-0">Wert</FormLabel>
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
                          <FormLabel className="gap-0">Farbe</FormLabel>
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
                          <FormLabel className="gap-0">Alert senden:</FormLabel>
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
                          <FormLabel className="gap-0">
                            Kritischer Alarm:
                          </FormLabel>
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
                          <FormLabel className="gap-0">
                            Nachricht
                            <div className="text-muted-foreground">*</div>
                          </FormLabel>
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
                    ...current.map((item) => ({
                      ...item,
                      condition: 'über' as 'über' | 'gleich' | 'unter', // Explicitly cast to union type
                    })),
                    {
                      value: 0,
                      condition: 'über',
                      color: '#006FEE', // Different default color
                      alert: {
                        send: true,
                        critical: false,
                        message: 'Luftfeuchtigkeitsgrenzwert überschritten',
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
                    <FormLabel className="gap-0">
                      Einheit<div className="text-muted-foreground">*</div>
                    </FormLabel>
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
                    <FormLabel className="gap-0">
                      Anzeigename<div className="text-muted-foreground">*</div>
                    </FormLabel>
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
                name={`configurations.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gap-0">Beschreibung</FormLabel>
                    <FormControl>
                      <Input placeholder="Optionale Beschreibung" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Thresholds section */}
              <div className="space-y-4">
                <FormLabel className="gap-0">Grenzwerte</FormLabel>
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
                            <FormLabel className="gap-0">
                              Bedingung
                              <div className="text-muted-foreground">*</div>
                            </FormLabel>
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
                      <FormField
                        control={form.control}
                        name={`configurations.${index}.grenzwerte.${thresholdIndex}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="gap-0">Wert</FormLabel>
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
                            <FormLabel className="gap-0">Farbe</FormLabel>
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
                            <FormLabel className="gap-0">
                              Alert senden:
                            </FormLabel>
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
                            <FormLabel className="gap-0">
                              Kritischer Alarm:
                            </FormLabel>
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
                            <FormLabel className="gap-0">
                              Nachricht
                              <div className="text-muted-foreground">*</div>
                            </FormLabel>
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
                      ...current.map((item) => ({
                        ...item,
                        condition: 'über' as 'über' | 'gleich' | 'unter', // Explicitly cast to union type
                      })),
                      {
                        value: 0,
                        condition: 'über',
                        color: '#F5A524', // Different default color
                        alert: {
                          send: true,
                          critical: false,
                          message: 'Luftdruck-Grenzwert überschritten',
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
        function handleSelect(option: ComboboxOptions) {
          form.setValue(`configurations.${index}.unit`, option.value as 'lux' | 'cd/m²' | 'fL');
        }
        return (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">Helligkeit Konfiguration</h3>
            <div className="space-y-4">
              {/* Unit selection */}
              <FormField
                control={form.control}
                name={`configurations.${index}.unit`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gap-0">
                      Einheit<div className="text-muted-foreground">*</div>
                    </FormLabel>
                                  <Combobox
                      options={['lux', 'cd/m²', 'fL'].map((unit) => (
                        // Add your unit options here
                        { value: unit, label: unit }
                      ))}
                      placeholder="Einheit wählen"
                      selected={field?.value ?? ''}
                      onChange={handleSelect}
                      onCreate={handleAppendGroup}
              />
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
              <FormLabel className="gap-0">
                Sensor-Name<div className="text-muted-foreground">*</div>
              </FormLabel>
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
              {/* Description field */}
              <FormField
                control={form.control}
                name={`configurations.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gap-0">Beschreibung</FormLabel>
                    <FormControl>
                      <Input placeholder="Optionale Beschreibung" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Measurement range
              <FormField
                control={form.control}
                name={`configurations.${index}.messbereich`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='gap-0'>Messbereich (lx)</FormLabel>
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

              <FormField
                control={form.control}
                name={`configurations.${index}.sensorTyp`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='gap-0'>Sensor Typ</FormLabel>
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

              <FormField
                control={form.control}
                name={`configurations.${index}.spektralbereich`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='gap-0'>Spektralbereich (nm)</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. 400-700" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`configurations.${index}.kalibrierungsdatum`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='gap-0'>Kalibrierungsdatum</FormLabel>
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

              <FormField
                control={form.control}
                name={`configurations.${index}.nachtsichtfähig`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-4">
                    <FormLabel className='gap-0'>Nachtsichtfähig:</FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              {/* Thresholds section */}
              <div className="space-y-4">
                <FormLabel className="gap-0">Grenzwerte</FormLabel>
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
                            <FormLabel className="gap-0">
                              Bedingung
                              <div className="text-muted-foreground">*</div>
                            </FormLabel>
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
                      <FormField
                        control={form.control}
                        name={`configurations.${index}.grenzwerte.${thresholdIndex}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="gap-0">Wert</FormLabel>
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
                            <FormLabel className="gap-0">Farbe</FormLabel>
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
                            <FormLabel className="gap-0">
                              Alert senden:
                            </FormLabel>
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
                            <FormLabel className="gap-0">
                              Kritischer Alarm:
                            </FormLabel>
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
                            <FormLabel className="gap-0">
                              Nachricht
                              <div className="text-muted-foreground">*</div>
                            </FormLabel>
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
                      ...current.map((item) => ({
                        ...item,
                        condition: 'über' as 'über' | 'gleich' | 'unter', // Explicitly cast to union type
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
        return (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">Luftqualität Konfiguration</h3>
            <div className="space-y-4">
              {/* Pollutant Types */}
              <FormField
                control={form.control}
                name={`configurations.${index}.unit`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gap-0">
                      Sensortyp<div className="text-muted-foreground">*</div>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Einheit wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {['PM2.5', 'PM10', 'CO2', 'VOC'].map((unit) => (
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
                    <FormLabel className="gap-0">
                      Anzeigename<div className="text-muted-foreground">*</div>
                    </FormLabel>
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
                name={`configurations.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gap-0">Beschreibung</FormLabel>
                    <FormControl>
                      <Input placeholder="Optionale Beschreibung" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Thresholds section */}
              <div className="space-y-4">
                <FormLabel className="gap-0">Grenzwerte</FormLabel>
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
                            <FormLabel className="gap-0">
                              Bedingung
                              <div className="text-muted-foreground">*</div>
                            </FormLabel>
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
                      <FormField
                        control={form.control}
                        name={`configurations.${index}.grenzwerte.${thresholdIndex}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="gap-0">Wert</FormLabel>
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
                            <FormLabel className="gap-0">Farbe</FormLabel>
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
                            <FormLabel className="gap-0">
                              Alert senden:
                            </FormLabel>
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
                            <FormLabel className="gap-0">
                              Kritischer Alarm:
                            </FormLabel>
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
                            <FormLabel className="gap-0">
                              Nachricht
                              <div className="text-muted-foreground">*</div>
                            </FormLabel>
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
                      ...current.map((item) => ({
                        ...item,
                        condition: 'über' as 'über' | 'gleich' | 'unter',
                      })),
                      {
                        value: 0,
                        condition: 'über',
                        color: '#00B388',
                        alert: {
                          send: true,
                          critical: false,
                          message: 'Luftqualitätsgrenzwert überschritten',
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
              <FormLabel className="gap-0">
                SensorID<div className="text-muted-foreground">*</div>
              </FormLabel>
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
              <FormLabel className="gap-0">
                Sensor Typ<div className="text-muted-foreground">*</div>
              </FormLabel>
              <Combobox
                options={frameworks}
                placeholder="Sensor Typ auswählen"
                selected={selectedFlameWork?.value ?? ''}
                onChange={handleSelect}
                onCreate={handleAppendGroup}
              />
              <FormDescription>
                Wählen Sie den Sensortyp aus{' '}
                {/* <Link href="/examples/forms" className="pl-1">
                  Dokumentation
                </Link> */}
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
              <FormLabel className="gap-0">
                Sensor-Name<div className="text-muted-foreground">*</div>
              </FormLabel>
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
              <FormLabel className="gap-0">Sensor-Beschreibung</FormLabel>
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
              <FormLabel className="gap-0">
                Standort<div className="text-muted-foreground">*</div>
              </FormLabel>
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
              <FormLabel className="gap-0">Sensor-Daten</FormLabel>
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

        <Button 
  className="w-20" 
  type="submit"
  disabled={isSubmitting}
>
  {isSubmitting ? 'Wird gesendet...' : 'Submit'}
</Button>


{Object.keys(form.formState.errors).length > 0 && (
  <div className="text-red-500 p-2 border rounded mb-4">
    Bitte beheben Sie alle Validierungsfehler bevor Sie absenden
    {Object.entries(form.formState.errors).map(([key, error]) => (
      <div key={key}>
        {key}: {(error as any)?.message|| 'Unbekannter Fehler'}
      </div>
    ))}
  </div>
)}

<Button 
  type="button" 
  onClick={() => console.log(form.formState.errors)}
>
  Debug
</Button>
      </form>
    </Form>
  );
}
