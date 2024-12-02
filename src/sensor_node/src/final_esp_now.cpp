// Include required libraries
#include <Arduino.h>
#include <esp_now.h>
#include <esp_wifi.h>
#include <WiFi.h>
#include <driver/i2s.h>

#define I2S_WS 14  // Word Select
#define I2S_SCK 12 // Serial Clock
#define I2S_SD 33  // Serial Data
#define I2S_PORT I2S_NUM_0
#define I2S_SAMPLE_RATE 16000
#define I2S_SAMPLE_BITS 16

// put function definitions here:
void i2sInit()
{
  const i2s_config_t i2s_config = {
      .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
      .sample_rate = I2S_SAMPLE_RATE,
      .bits_per_sample = i2s_bits_per_sample_t(I2S_SAMPLE_BITS),
      .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
      .communication_format = i2s_comm_format_t(I2S_COMM_FORMAT_STAND_I2S),
      .intr_alloc_flags = 0,
      .dma_buf_count = 64,
      .dma_buf_len = 1024,
      .use_apll = 1};
  i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
  Serial.println("I2S installed.");
  const i2s_pin_config_t pin_config = {
      .bck_io_num = I2S_SCK,
      .ws_io_num = I2S_WS,
      .data_out_num = -1,
      .data_in_num = I2S_SD};

  i2s_set_pin(I2S_PORT, &pin_config);
}

const int ldrPin = 34;
const int echoPin = 27;
const int trigPin = 25;
const int smokeSensor = 35;
const int motionSensor = 26;

long duration, distance;

// Responder MAC Address (Replace with your responders MAC Address)
uint8_t broadcastAddress[] = {0x30, 0x30, 0xF9, 0x72, 0x80, 0x84};

// Define data structure
typedef struct struct_message
{
  float ldr;
  float dist;
  float smk;
  bool motion;
  float db;
} struct_message;

// Create structured data object
struct_message myData;

// Register peer
esp_now_peer_info_t peerInfo;

constexpr char WIFI_SSID[] = "Art";

int32_t getWiFiChannel(const char *ssid)
{
  if (int32_t n = WiFi.scanNetworks())
  {
    for (uint8_t i = 0; i < n; i++)
    {
      if (!strcmp(ssid, WiFi.SSID(i).c_str()))
      {
        return WiFi.channel(i);
      }
    }
  }
  return 0;
}

float ldrSum = 0;
float distSum = 0;
float smkSum = 0;
bool motionDetected = false;

int counter = 0;

void OnDataSent(const uint8_t *macAddr, esp_now_send_status_t status)
{
  Serial.print("Last Packet Send Status: ");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

float calculateDecibels(int16_t *samples, size_t sampleCount)
{
  double sumSquared = 0.0;
  for (size_t i = 0; i < sampleCount; i++)
  {
    // Normalize sample and calculate sum of squares
    double normalizedSample = samples[i] / 32768.0;
    sumSquared += normalizedSample * normalizedSample;
  }

  // Calculate RMS
  double rms = sqrt(sumSquared / sampleCount);

  // Convert to decibels, with a noise floor
  if (rms < 0.00001)
    return 0; // Very quiet

  // More accurate decibel conversion
  float decibels = 20.0 * log10(rms) + 90; // Adjust offset for more realistic dB readings
  return constrain(decibels, 0, 120);      // Reasonable human hearing range
}

void setup()
{

  Serial.begin(9600);
  delay(100);

  pinMode(ldrPin, INPUT);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(motionSensor, INPUT);
  pinMode(smokeSensor, INPUT);

  i2sInit();

  delay(1000);

  // Set ESP32 WiFi mode to Station temporarly
  WiFi.mode(WIFI_STA);

  int32_t channel = getWiFiChannel(WIFI_SSID);

  //   WiFi.printDiag(Serial); // Uncomment to verify channel number before
  esp_wifi_set_promiscuous(true);
  esp_wifi_set_channel(channel, WIFI_SECOND_CHAN_NONE);
  esp_wifi_set_promiscuous(false);
  //   WiFi.printDiag(Serial); // Uncomment to verify channel change after

  // Initialize ESP-NOW
  if (esp_now_init() != 0)
  {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  // Define callback
  esp_now_register_send_cb(OnDataSent);

  // Register peer
  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = 0;
  peerInfo.encrypt = false;

  if (esp_now_add_peer(&peerInfo) != ESP_OK)
  {
    Serial.println("Failed to add peer");
    return;
  }
}

// Variable to accumulate decibel readings
double dbSum = 0;

void loop()
{
  // Buffer to store audio samples
  int16_t sample_buffer[64]; // Use int16_t for 16-bit samples
  size_t bytes_read;

  // Read audio data from I2S
  int bytes = i2s_read(I2S_PORT, sample_buffer, sizeof(sample_buffer), &bytes_read, portMAX_DELAY);

  if (bytes == ESP_OK)
  {
    // Calculate number of samples read
    int num_samples = bytes_read / sizeof(int16_t);
    float loudness = calculateDecibels(sample_buffer, num_samples);
    // Accumulate decibel readings
    dbSum += loudness;
  }

  // Other sensor code...
  // Ultrasonic, LDR, Smoke, Motion...
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  duration = pulseIn(echoPin, HIGH);
  distance = duration / 58.2;

  int ldrValue = analogRead(ldrPin);
  int smokeValue = analogRead(smokeSensor);
  int isMotionDetected = digitalRead(motionSensor);

  ldrSum += ldrValue;
  distSum += distance;
  smkSum += smokeValue;
  

  if (isMotionDetected == 1)
  {
    motionDetected = true;
  }

  counter++;

  if (counter >= 3)
  {
    // Compute average readings
    myData.ldr = ldrSum / 3.0;
    myData.dist = distSum / 3.0;
    myData.smk = smkSum / 3.0;
    myData.motion = motionDetected;
    myData.db = (dbSum / 3.0); // Average decibel reading

    // Print averaged readings
    Serial.print("LDR: ");
    Serial.println(myData.ldr);
    Serial.print("Dist: ");
    Serial.println(myData.dist);
    Serial.print("Smoke: ");
    Serial.println(myData.smk);
    Serial.print("Motion Detected: ");
    Serial.println(myData.motion);
    Serial.print("Average Loudness: ");
    Serial.println(myData.db);

    // Send data via ESP-NOW
    esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *)&myData, sizeof(myData));
    if (result == ESP_OK)
    {
      Serial.println("Sent with success");
    }
    else
    {
      Serial.println("Error sending the data");
    }

    // Reset accumulators
    ldrSum = 0;
    distSum = 0;
    smkSum = 0;
    dbSum = 0; // Reset decibel sum
    motionDetected = false;
    counter = 0;
  }

  delay(1000);
}