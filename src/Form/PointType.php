<?php

namespace App\Form;

use App\Entity\Point;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type;

class PointType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', Type\TextType::class, [
                'label' => "Nom du point d'intérêt"
            ])
            ->add('address', Type\TextType::class, [
                'label' => "Adresse"
            ])
            ->add('latitude', Type\HiddenType::class)
            ->add('longitude', Type\HiddenType::class)
            ->add('submit', Type\SubmitType::class, [
                'label' => "Valider"
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Point::class,
            'csrf_protection'   => false,
        ]);
    }
}
