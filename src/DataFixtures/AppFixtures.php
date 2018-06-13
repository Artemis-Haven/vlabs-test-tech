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
            $point = new Point();
            $point->setName('Point '.$i);
            $point->setAddress($i.' Rue de la Paix, Paris');
            $point->setCoord('44.43'.$i, '4.87'.$i);
            $manager->persist($point);
        }

        $manager->flush();
    }
}