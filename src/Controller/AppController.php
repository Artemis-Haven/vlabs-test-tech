<?php

namespace App\Controller;

use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Entity\Point;
use App\Form\PointType;

class AppController extends Controller
{
    /**
     * Page d'accueil affichant la liste des points d'intérêts et une carte
     * 
     * @Route("/", name="homepage")
     * @Template
     */
    public function index()
    {
    	$pointsOfInterest = $this->getDoctrine()->getManager()->getRepository('App:Point')->findAll();
    	$newPointForm = $this->createNewPointForm(new Point(null, null, '42', '4'));

        return [
        	'pointsOfInterest' => $pointsOfInterest,
        	'newPointForm' => $newPointForm->createView()
        ];
    }


    /**
     * @Route("/ajax/new-point", name="new_point")
     * @Method("POST")
     */
    public function newPoint(Request $request)
    {
    	if (!$request->isXmlHttpRequest()) {
	        return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
	    }
		$point = new Point();
    	$em = $this->getDoctrine()->getManager();
    	$newPointForm = $this->createNewPointForm($point);

		$newPointForm->handleRequest($request);
		if ($newPointForm->isSubmitted() && $newPointForm->isValid()) {
			$em->persist($point);
			$em->flush();

        	return new JsonResponse(['2']);
		}

        return new JsonResponse(["Erreur à l'enregistrement du point d'intérêt"]);
    }


    private function createNewPointForm(Point $point)
    {
    	return $this->createForm(PointType::class, $point, [
    		'method' => 'POST',
    		'action' => $this->generateUrl('new_point')
    	]);
    }
}
