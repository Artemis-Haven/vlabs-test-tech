<?php

namespace App\DataFixtures;

use App\Entity\Point;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager)
    {
        for ($i = 0; $i < 20; $i++) {
            $point = new Point(
                'Point '.$i, 
                $i.' Rue de la Paix, Paris',
                '44.43'.str_pad($i, 2, '0', STR_PAD_LEFT), 
                '4.87'.str_pad($i, 2, '0', STR_PAD_LEFT)
            );
            $manager->persist($point);
        }

        $manager->flush();
    }
}