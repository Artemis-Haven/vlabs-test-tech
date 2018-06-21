<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AppControllerTest extends WebTestCase
{
    public function testNewPoint()
    {
        $client = static::createClient();
		
		$payload = ['point' => [
			'name' => "Tour Eiffel",
	        'address' => "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
			'latitude' => "48.85837009999999",
			'longitude' => "2.2944813000000295",
		]];

        $client->request('POST', '/ajax/new-point', $payload, [], [
        	'HTTP_Content-Type' => 'application/json',
        	'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest'
        ]);

        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        
        $html = json_decode($client->getResponse()->getContent())->html;
        $this->assertTrue(strpos($html, '<p class="poi-name">Tour Eiffel</p>') !== false);
        $this->assertTrue(strpos($html, '<p class="poi-address">Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France</p>') !== false);
        $this->assertTrue(strpos($html, 'data-lat="48.85837009999999"') !== false);
        $this->assertTrue(strpos($html, 'data-long="2.2944813000000295"') !== false);
    }
}
