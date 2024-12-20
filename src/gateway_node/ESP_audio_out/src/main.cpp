#include <SPIFFS.h>
#include <Arduino.h>
#include <freertos/FreeRTOS.h>
#include <driver/i2s.h>
#include <freertos/task.h>
#include <I2SOutput.h>
#include <WiFi.h>
#include <esp_now.h>
#include <Arduino.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#define MINIMP3_IMPLEMENTATION
#define MINIMP3_ONLY_MP3
#define MINIMP3_NO_STDIO

#include "minimp3.h"
// Firebase credentials
#define API_KEY "AIzaSyAcn2NP3GnRnB6XGOVo6BovV1nY8ahvNOI"                                      // Replace with your project ID
#define DATABASE_URL "https://embedded-cedt-default-rtdb.asia-southeast1.firebasedatabase.app" // Database Secret / Auth Token
// WiFi credentials
// #define WIFI_SSID "vvv"
// #define WIFI_PASSWORD "12341234"
#define WIFI_SSID "Art"
#define WIFI_PASSWORD "66666666"
// Define data structure

typedef struct struct_message
{
  float LDR;
  float dist;
  float smk;
  bool motion;
  float db;
} struct_message;

// Create structured data object
struct_message myData;

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
bool signupOK = false;

// Task handles
TaskHandle_t taskHandleReceive;

// Audio output configuration (I2S)
#define I2S_SPEAKER_SERIAL_CLOCK GPIO_NUM_2
#define I2S_SPEAKER_LEFT_RIGHT_CLOCK GPIO_NUM_15
#define I2S_SPEAKER_SERIAL_DATA GPIO_NUM_4
#define I2S_PORT I2S_NUM_0
#define SAMPLE_RATE 44100

// Configuration macros
#define GPIO_BUTTON GPIO_NUM_3
#define BUFFER_SIZE 30000

// Global objects
i2s_pin_config_t i2s_speaker_pins = {
    .bck_io_num = I2S_SPEAKER_SERIAL_CLOCK,
    .ws_io_num = I2S_SPEAKER_LEFT_RIGHT_CLOCK,
    .data_out_num = I2S_SPEAKER_SERIAL_DATA,
    .data_in_num = I2S_PIN_NO_CHANGE};

Output *audioOutput = nullptr; // Global to reuse the output object
bool isOutputInitialized = false;

void initializeAudioOutput()
{
  if (!isOutputInitialized)
  {
    audioOutput = new I2SOutput(I2S_NUM_0, i2s_speaker_pins);
    if (!audioOutput)
    {
      Serial.println("Failed to initialize audio output");
      return;
    }
    isOutputInitialized = true;
  }
}

// Task to play audio from an MP3 file
void play_audio(const char *filePath)
{
  // Initialize the audio output
  initializeAudioOutput();
  if (!audioOutput)
  {
    Serial.println("Failed to initialize output");
    vTaskDelete(NULL);
    return;
  }
  // Mount the SPIFFS file system
  SPIFFS spiffs("/fs");
  // Allocate memory for PCM buffers and input buffer
  short *pcm1 = (short *)malloc(sizeof(short) * MINIMP3_MAX_SAMPLES_PER_FRAME * 2);
  short *pcm2 = (short *)malloc(sizeof(short) * MINIMP3_MAX_SAMPLES_PER_FRAME * 2);
  uint8_t *input_buf = (uint8_t *)malloc(BUFFER_SIZE);

  // Check memory allocation
  if (!pcm1 || !pcm2 || !input_buf)
  {
    Serial.println("Failed to allocate memory");
    free(pcm1);
    free(pcm2);
    free(input_buf);
    vTaskDelay(pdMS_TO_TICKS(1000));
    return;
  }

  // Open the MP3 file
  FILE *fp = fopen(filePath, "r");
  if (!fp)
  {
    Serial.println("Failed to open MP3 file");
    free(pcm1);
    free(pcm2);
    free(input_buf);
    vTaskDelay(pdMS_TO_TICKS(1000));
    return;
  }

  // Initialize the MP3 decoder
  mp3dec_t mp3d = {};
  mp3dec_init(&mp3d);
  mp3dec_frame_info_t info = {};

  bool is_output_started = false;
  int buffered = fread(input_buf, 1, BUFFER_SIZE, fp);
  int current_pcm = 0; // 0: pcm1, 1: pcm2

  // Process the MP3 frames
  while (buffered > 0)
  {
    short *pcm = (current_pcm == 0) ? pcm1 : pcm2;
    int samples = mp3dec_decode_frame(&mp3d, input_buf, buffered, pcm, &info);
    // If samples are decoded, write them to the output
    if (samples > 0)
    {
      if (!is_output_started)
      {
        audioOutput->start(info.hz);
        is_output_started = true;
      }

      // Convert mono to stereo if needed
      if (info.channels == 1)
      {
        for (int i = samples - 1; i >= 0; i--)
        {
          pcm[i * 2] = pcm[i];
          pcm[i * 2 + 1] = pcm[i];
        }
      }
      // Write samples to the audio output
      audioOutput->write(pcm, samples);
    }

    buffered -= info.frame_bytes;
    if (buffered > 0)
    {
      memmove(input_buf, input_buf + info.frame_bytes, buffered);
    }

    size_t n = fread(input_buf + buffered, 1, BUFFER_SIZE - buffered, fp);
    buffered += n;

    current_pcm = 1 - current_pcm; // Toggle PCM buffer
  }

  // Cleanup and close files, free memory
  fclose(fp);
  audioOutput->stop();
  free(input_buf);
  free(pcm1);
  free(pcm2);
  // Delay before the next loop iteration
  vTaskDelay(pdMS_TO_TICKS(100));
}

void TaskPlayVoicelines(void *pvParameters)
{
  while (true)
  {
    if (myData.smk >= 1000)
    {
      Serial.println("Playing 'Smoke detected' voiceline...");
      play_audio("/fs/smoke.mp3");
    }
    int touchValue = digitalRead(GPIO_NUM_3);
    if (touchValue == HIGH)
    {
      Serial.println("Touch sensor activated");
      if (myData.db >= 60)
      {
        Serial.println("Playing 'loud noise' voiceline...");
        play_audio("/fs/loud_noise.mp3");
      }
      else if (myData.db >= 30)
      {
        Serial.println("Playing 'medium noise' voiceline...");
        play_audio("/fs/medium_noise.mp3");
      }
      else
      {
        Serial.println("Playing 'low noise' voiceline...");
        play_audio("/fs/low_noise.mp3");
      }
      // Check LDR conditions
      if (myData.LDR <= 400)
      {
        Serial.println("Playing 'No light' voiceline...");
        play_audio("/fs/light_low.mp3");
      }
      else if (myData.LDR <= 1500)
      {
        Serial.println("Playing 'Dim light' voiceline...");
        play_audio("/fs/light_med.mp3");
      }
      else
      {
        Serial.println("Playing 'Bright' voiceline...");
        play_audio("/fs/light_max.mp3");
      }

      // Check distance conditions
      if (myData.dist >= 200)
      {
        Serial.println("Playing 'No object' voiceline...");
        play_audio("/fs/no_obj.mp3");
      }
      else if (myData.dist >= 100)
      {
        Serial.println("Playing 'Far' voiceline...");
        play_audio("/fs/dist_far.mp3");
      }
      else
      {
        Serial.println("Playing 'Near' voiceline...");
        play_audio("/fs/dist_near.mp3");
      }

      // Check smoke conditions
      if (myData.smk >= 700)
      {
        Serial.println("Playing 'Smoke detected' voiceline...");
        play_audio("/fs/smoke.mp3");
      }
      else
      {
        Serial.println("Playing 'No smoke' voiceline...");
        play_audio("/fs/no_smoke.mp3");
      }

      // Check motion conditions
      if (myData.motion >= 0.5)
      {
        Serial.println("Playing 'Motion detected' voiceline...");
        play_audio("/fs/motion.mp3");
      }
      else
      {
        Serial.println("Playing 'No motion' voiceline...");
        play_audio("/fs/no_motion.mp3");
      }
      // Delay between checks to avoid spamming the voicelines
      vTaskDelay(pdMS_TO_TICKS(2000)); // Adjust delay as needed
    }
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

// Callback function to handle received data
void OnDataRecv(const uint8_t *mac, const uint8_t *incomingData, int len)
{
  Serial.println("OnDataRecv activated!");
  // Copy incoming data into the structured object
  memcpy(&myData, incomingData, sizeof(myData));
  // Print the received data to Serial Monitor
  Serial.print("LDR: ");
  Serial.println(myData.LDR);
  Serial.print("dist: ");
  Serial.println(myData.dist);
  Serial.print("Smoke: ");
  Serial.println(myData.smk);
  Serial.print("Motion: ");
  Serial.println(myData.motion);
  Serial.print("Loudness: ");
  Serial.println(myData.db);
}

// Task to handle ESP-NOW reception
void TaskReceiveData(void *pvParameters)
{
  Serial.println("TaskReceiveData activated!");

  // Initialize ESP-NOW
  if (esp_now_init() != 0)
  {
    Serial.println("Error initializing ESP-NOW");
    vTaskDelete(NULL); // End the task if ESP-NOW initialization fails
  }

  // Register callback function for ESP-NOW reception
  esp_now_register_recv_cb(OnDataRecv);

  // Infinite loop to keep the task running
  while (1)
  {
    vTaskDelay(pdMS_TO_TICKS(100)); // Yield task to prevent blocking
  }
}

// Task to handle Firebase communication
void TaskSendData(void *pvParameters)
{
  // Wait for Wi-Fi connection
  while (WiFi.status() != WL_CONNECTED)
  {
    vTaskDelay(pdMS_TO_TICKS(500));
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi");

  // Configure Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Sign up with Firebase
  if (Firebase.signUp(&config, &auth, "", ""))
  {
    Serial.println("Firebase sign-up successful.");
    signupOK = true;
  }
  else
  {
    Serial.printf("Sign-up error: %s\n", config.signer.signupError.message.c_str());
    vTaskDelete(NULL); // End the task if sign-up fails
  }

  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  unsigned long lastTime = 0;

  // Infinite loop to send data to Firebase every 2 seconds
  while (1)
  {
    if (Firebase.ready() && signupOK && millis() - lastTime > 3000)
    {
      lastTime = millis();

      // Send data to Firebase RTDB
      if (Firebase.RTDB.setFloat(&fbdo, "currentState/LDR", myData.LDR))
      {
        Serial.println("LDR data sent!");
      }
      else
      {
        Serial.println(fbdo.errorReason());
      }

      // Send additional data to Firebase
      Firebase.RTDB.setFloat(&fbdo, "currentState/dist", myData.dist);
      Firebase.RTDB.setFloat(&fbdo, "currentState/smk", myData.smk);
      Firebase.RTDB.setBool(&fbdo, "currentState/motion", myData.motion);
      Firebase.RTDB.setFloat(&fbdo, "currentState/loudness", myData.db);
      Firebase.RTDB.setTimestamp(&fbdo, "currentState/timestamp");

      FirebaseJson json;
      json.set("dist", myData.dist);
      json.set("smk", myData.smk);
      json.set("motion", myData.motion);
      json.set("ldr", myData.LDR);
      json.set("loudness", myData.db);
      json.set("timestamp/.sv", "timestamp");
      if (Firebase.RTDB.pushJSON(&fbdo, "/log", &json))
      {
        Serial.println(String(fbdo.pushName()));
      }
      else
      {
        Serial.println(fbdo.errorReason());
      }
    }

    vTaskDelay(pdMS_TO_TICKS(50)); // Yield task to prevent blocking
  }
}

void setup()
{
  // Start Serial communication for debugging
  Serial.begin(9600);
  delay(5000);
  Serial.println("Starting...");

  // Initialize Wi-Fi connection
  WiFi.mode(WIFI_AP_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to Wi-Fi");
  // Wait for Wi-Fi connection
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nSetting as a Wi-Fi station");
  Serial.print("Station IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Wi-Fi Channel: ");
  Serial.println(WiFi.channel());
  // Create tasks for receiving data and sending data
  xTaskCreatePinnedToCore(TaskReceiveData, "ReceiveData", 10000, NULL, 1, &taskHandleReceive, 0);
  xTaskCreatePinnedToCore(TaskSendData, "SendData", 10000, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(TaskPlayVoicelines, "PlayVoicelines", 150000, NULL, 2, NULL, 1);
}

// Empty loop since tasks are handling the operations
void loop()
{
  // Empty loop since tasks are handling the operations
}
