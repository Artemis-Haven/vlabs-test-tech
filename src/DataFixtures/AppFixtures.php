<?php

namespace App\DataFixtures;

use App\Entity\Point;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager)
    {
        $points = [
            ['name' => "Tour Eiffel", 'address' => "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France", 'latitude' => "48.85837009999999", 'longitude' => "2.2944813000000295"], 
            ['name' => "Panthéon", 'address' => "Place du Panthéon, 75005 Paris, France", 'latitude' => "48.8462218", 'longitude' => "2.3464137999999366"], 
            ['name' => "Palais de l'Elysée", 'address' => "55 Rue du Faubourg Saint-Honoré, 75008 Paris, France", 'latitude' => "48.8704156", 'longitude' => "2.3167538999999806"], 
            ['name' => "Grand Palais", 'address' => "3 Avenue du Général Eisenhower, 75008 Paris, France", 'latitude' => "48.8661091", 'longitude' => "2.3124543999999787"], 
            ['name' => "Cimetière du Père Lachaise", 'address' => "16 Rue du Repos, 75020 Paris, France", 'latitude' => "48.861393", 'longitude' => "2.3933276000000205"], 
            ['name' => "Bibliothèque François Mitterrand", 'address' => "Quai François Mauriac, 75706 Paris, France", 'latitude' => "48.8335842", 'longitude' => "2.375765900000033"], 
            ['name' => "Tour Montparnasse", 'address' => "33 Avenue du Maine, 75015 Paris, France", 'latitude' => "48.8421379", 'longitude' => "2.321951399999989"], 
            ['name' => "Grand Rex", 'address' => "1 Boulevard Poissonnière, 75002 Paris, France", 'latitude' => "48.8705638", 'longitude' => "2.3474873999999772"], 
            ['name' => "Cité des Sciences et de l'Industrie", 'address' => "30 Avenue Corentin Cariou, 75019 Paris, France", 'latitude' => "48.8955948", 'longitude' => "2.387899599999969"]
        ];
        foreach ($points as $p) {
            $point = new Point($p['name'], $p['address'], $p['latitude'], $p['longitude']);
            $manager->persist($point);
        }

        $manager->flush();
    }
}