<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmergencyHotline;
use Carbon\Carbon;

class EmergencyHotlineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hotlines = [
            [
                'type' => 'Fire',
                'hotline' => '911',
                'description' => 'Fire Department Emergency Hotline - Call for fire emergencies, rescue operations, and fire safety assistance',
                'status' => 'Active',
                'last_updated' => Carbon::now()->toDateString(),
                'contact_person' => 'Fire Chief',
                'email' => 'fire@barangay.gov.ph',
                'procedure' => [
                    '1. Dial 911 immediately',
                    '2. Provide your exact location and address',
                    '3. Describe the nature and extent of the fire',
                    '4. Stay on the line until help arrives',
                    '5. Evacuate the area if safe to do so'
                ],
            ],
            [
                'type' => 'Police',
                'hotline' => '911',
                'description' => 'Police Emergency Hotline - Report crimes, accidents, and security concerns',
                'status' => 'Active',
                'last_updated' => Carbon::now()->toDateString(),
                'contact_person' => 'Police Chief',
                'email' => 'police@barangay.gov.ph',
                'procedure' => [
                    '1. Dial 911 for emergencies',
                    '2. Provide your location',
                    '3. Describe the incident clearly',
                    '4. Stay on the line for instructions',
                    '5. Wait for police response'
                ],
            ],
            [
                'type' => 'Medical Emergency',
                'hotline' => '911',
                'description' => 'Medical Emergency Hotline - For medical emergencies, ambulance services, and health crises',
                'status' => 'Active',
                'last_updated' => Carbon::now()->toDateString(),
                'contact_person' => 'Medical Officer',
                'email' => 'medical@barangay.gov.ph',
                'procedure' => [
                    '1. Call 911 immediately',
                    '2. Describe the medical condition',
                    '3. Provide exact location',
                    '4. Follow first aid instructions if given',
                    '5. Stay with the patient until help arrives'
                ],
            ],
            [
                'type' => 'Ambulance',
                'hotline' => '911',
                'description' => 'Ambulance Service - Emergency medical transport and response',
                'status' => 'Active',
                'last_updated' => Carbon::now()->toDateString(),
                'contact_person' => 'Emergency Medical Services',
                'email' => 'ambulance@barangay.gov.ph',
                'procedure' => [
                    '1. Call 911 for ambulance',
                    '2. State the nature of emergency',
                    '3. Provide location and landmarks',
                    '4. Keep patient calm and stable',
                    '5. Clear path for ambulance access'
                ],
            ],
            [
                'type' => 'Rescue',
                'hotline' => '911',
                'description' => 'Rescue Operations - For search and rescue, disaster response, and emergency assistance',
                'status' => 'Active',
                'last_updated' => Carbon::now()->toDateString(),
                'contact_person' => 'Rescue Team Leader',
                'email' => 'rescue@barangay.gov.ph',
                'procedure' => [
                    '1. Call 911 for rescue',
                    '2. Describe the situation',
                    '3. Provide exact location',
                    '4. Indicate number of people involved',
                    '5. Follow safety instructions'
                ],
            ],
            [
                'type' => 'Flood',
                'hotline' => '911',
                'description' => 'Flood Emergency Hotline - Report flooding, water-related emergencies, and evacuation assistance',
                'status' => 'Active',
                'last_updated' => Carbon::now()->toDateString(),
                'contact_person' => 'Disaster Response Team',
                'email' => 'flood@barangay.gov.ph',
                'procedure' => [
                    '1. Call 911 immediately',
                    '2. Report flood location and severity',
                    '3. Request evacuation if needed',
                    '4. Move to higher ground',
                    '5. Avoid walking through floodwaters'
                ],
            ],
            [
                'type' => 'Earthquake',
                'hotline' => '911',
                'description' => 'Earthquake Emergency Response - For earthquake-related emergencies and post-earthquake assistance',
                'status' => 'Active',
                'last_updated' => Carbon::now()->toDateString(),
                'contact_person' => 'Disaster Management',
                'email' => 'earthquake@barangay.gov.ph',
                'procedure' => [
                    '1. Drop, Cover, and Hold On during shaking',
                    '2. Call 911 after shaking stops',
                    '3. Report injuries and damage',
                    '4. Evacuate damaged buildings',
                    '5. Check for gas leaks and fires'
                ],
            ],
            [
                'type' => 'Typhoon',
                'hotline' => '911',
                'description' => 'Typhoon Emergency Hotline - For typhoon warnings, evacuation, and storm-related emergencies',
                'status' => 'Active',
                'last_updated' => Carbon::now()->toDateString(),
                'contact_person' => 'Weather Emergency Team',
                'email' => 'typhoon@barangay.gov.ph',
                'procedure' => [
                    '1. Monitor weather updates',
                    '2. Call 911 for evacuation assistance',
                    '3. Secure property and belongings',
                    '4. Move to evacuation centers if needed',
                    '5. Stay indoors during the storm'
                ],
            ],
            [
                'type' => 'Disaster Response',
                'hotline' => '911',
                'description' => 'Disaster Response Team - Coordinated response for natural disasters and emergencies',
                'status' => 'Active',
                'last_updated' => Carbon::now()->toDateString(),
                'contact_person' => 'Disaster Response Coordinator',
                'email' => 'disaster@barangay.gov.ph',
                'procedure' => [
                    '1. Call 911 for disaster response',
                    '2. Report type and extent of disaster',
                    '3. Provide location and affected areas',
                    '4. Request specific assistance needed',
                    '5. Follow evacuation orders if given'
                ],
            ],
            [
                'type' => 'Emergency Management',
                'hotline' => '911',
                'description' => 'Emergency Management Office - Central coordination for all emergency situations',
                'status' => 'Active',
                'last_updated' => Carbon::now()->toDateString(),
                'contact_person' => 'Emergency Manager',
                'email' => 'emergency@barangay.gov.ph',
                'procedure' => [
                    '1. Call 911 for emergency management',
                    '2. Describe the emergency situation',
                    '3. Provide all relevant details',
                    '4. Follow instructions from emergency personnel',
                    '5. Stay informed through official channels'
                ],
            ],
        ];

        foreach ($hotlines as $hotline) {
            EmergencyHotline::updateOrCreate(
                [
                    'type' => $hotline['type'],
                    'hotline' => $hotline['hotline'],
                ],
                $hotline
            );
        }

        if ($this->command) {
            $this->command->info('✅ Emergency Hotlines seeded successfully!');
        }
    }
}

