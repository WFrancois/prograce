<?php

namespace ProgressNotification\Service;


class Util
{
    const REGION = [
        'world' => 'World',
        'us' => 'US',
        'eu' => 'EU',
        'kr' => 'KR',
        'tw' => 'TW',
    ];

    public static function getOrdinal(int $number): string
    {
        $ends = array('th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th');
        if ((($number % 100) >= 11) && (($number % 100) <= 13)) {
            return $number . 'th';
        }
        return $number . $ends[$number % 10];
    }

    public static function getBossName(int $bossId): string
    {
        $bossIds = [
            26533 => "Lords of Dread",
            180773 => "Vigilant Guardian",
            181224 => "Dausegne",
            181549 => "Prototype Pantheon",
            181954 => "Anduin Wrynn",
            182169 => "Lihuvim",
            182777 => "Rygelon",
            183501 => "Artificer Xy'mox",
            183937 => "Skolex",
            184915 => "Halondrus",
            185421 => "The Jailer",
        ];

        return $bossIds[$bossId] ?? '';
    }
}
